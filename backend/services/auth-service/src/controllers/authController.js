const bcrypt = require('bcryptjs');
const jwtUtils = require('../utils/jwt');
const NICValidator = require('../utils/nicValidator');
const TokenBlacklist = require('../utils/tokenBlacklist');
const AuthRateLimit = require('../utils/authRateLimit');
const db = require('../config/database');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema
} = require('../validation/authValidation');

class AuthController {
  /**
   * User registration with comprehensive NIC validation
   */
  static async register(req, res) {
    try {
      // Get language preference from request
      const language = req.body.preferredLanguage || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
      
      // Validate request body
      const { error, value } = registerSchema.validate(req.body, {
        context: { language },
        abortEarly: false
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            code: detail.type
          }))
        });
      }

      const {
        email,
        password,
        firstName,
        lastName,
        nicNumber,
        phoneNumber,
        preferredLanguage,
        address,
        dateOfBirth
      } = value;

      // Comprehensive NIC validation with database duplicate check
      const nicValidation = await NICValidator.validateWithDatabaseCheck(
        nicNumber,
        db,
        language
      );

      if (!nicValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: nicValidation.error,
          code: nicValidation.code,
          field: 'nicNumber'
        });
      }

      // Check if email already exists
      const emailCheck = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (emailCheck.rows.length > 0) {
        const messages = NICValidator.ERROR_MESSAGES[language] || NICValidator.ERROR_MESSAGES.en;
        return res.status(400).json({
          success: false,
          message: language === 'si' ? 'මෙම ඊ-මේල් ලිපිනය දැනටමත් ලියාපදිංචි කර ඇත' :
                   language === 'ta' ? 'இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது' :
                   'This email address is already registered',
          code: 'EMAIL_ALREADY_EXISTS',
          field: 'email'
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Extract birth date from NIC if not provided
      const finalBirthDate = dateOfBirth || nicValidation.details.birthDate;

      // Insert new user
      const insertQuery = `
        INSERT INTO users (
          email, password_hash, first_name, last_name, nic_number,
          phone_number, preferred_language, address, date_of_birth,
          is_active, email_verified, phone_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, email, first_name, last_name, nic_number, 
                 phone_number, preferred_language, created_at, is_active
      `;

      const insertValues = [
        email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        nicValidation.details.formattedNIC,
        phoneNumber,
        preferredLanguage || 'en',
        address,
        finalBirthDate,
        true, // is_active
        false, // email_verified
        false  // phone_verified
      ];

      const result = await db.query(insertQuery, insertValues);
      const newUser = result.rows[0];

      // Generate tokens
      const tokens = jwtUtils.generateTokens({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        nic_number: newUser.nic_number,
        role: 'citizen'
      });

      // Log successful registration
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent, success)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          newUser.id,
          'user_registration',
          'user',
          newUser.id,
          JSON.stringify({ email: newUser.email, nic_number: newUser.nic_number }),
          req.ip,
          req.get('User-Agent'),
          true
        ]
      );

      // Prepare response
      const response = {
        success: true,
        message: language === 'si' ? 'ලියාපදිංචිය සාර්ථකයි' :
                 language === 'ta' ? 'பதிவு வெற்றிகரமானது' :
                 'Registration successful',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.first_name,
            lastName: newUser.last_name,
            nicNumber: newUser.nic_number,
            phoneNumber: newUser.phone_number,
            preferredLanguage: newUser.preferred_language,
            createdAt: newUser.created_at,
            isActive: newUser.is_active,
            personalInfo: nicValidation.details
          },
          tokens
        }
      };

      res.status(201).json(response);

    } catch (error) {
      console.error('Registration error:', error);

      // Log failed registration attempt
      if (req.body?.email) {
        try {
          await db.query(
            `INSERT INTO audit_logs (action, entity_type, new_values, ip_address, user_agent, success, error_message)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              'user_registration_failed',
              'user',
              JSON.stringify({ email: req.body.email }),
              req.ip,
              req.get('User-Agent'),
              false,
              error.message
            ]
          );
        } catch (logError) {
          console.error('Failed to log registration error:', logError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed due to server error',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Enhanced user login with JWT token generation
   * Supports login via email or phone number with advanced rate limiting
   */
  static async login(req, res) {
    try {
      const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';

      // Validate request body
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials format',
          code: 'VALIDATION_ERROR',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const { email, phone, password } = value;
      const loginField = email || phone;

      // Determine if login is by email or phone
      const isEmailLogin = !!email;
      const isPhoneLogin = !!phone;

      // Find user by email or phone
      let userQuery, queryParams;
      
      if (isEmailLogin) {
        userQuery = `
          SELECT id, email, password_hash, first_name, last_name, nic_number,
                 phone_number, preferred_language, is_active, email_verified, 
                 global_logout_time
          FROM users 
          WHERE email = $1
        `;
        queryParams = [email.toLowerCase()];
      } else {
        userQuery = `
          SELECT id, email, password_hash, first_name, last_name, nic_number,
                 phone_number, preferred_language, is_active, phone_verified,
                 global_logout_time
          FROM users 
          WHERE phone_number = $1
        `;
        queryParams = [phone];
      }
      
      const userResult = await db.query(userQuery, queryParams);

      if (userResult.rows.length === 0) {
        // Record failed attempt
        await AuthRateLimit.recordAttempt(
          req.ip, 
          loginField, 
          false, 
          req.get('User-Agent')
        );

        // Log failed login attempt
        await db.query(
          `INSERT INTO audit_logs (action, entity_type, new_values, ip_address, user_agent, success, error_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            'login_failed',
            'user',
            JSON.stringify({ [isEmailLogin ? 'email' : 'phone']: loginField }),
            req.ip,
            req.get('User-Agent'),
            false,
            'User not found'
          ]
        );

        return res.status(401).json({
          success: false,
          message: language === 'si' ? 'වලංගු නොවන අක්තපත්‍ර' :
                   language === 'ta' ? 'தவறான சான்றுகள்' :
                   'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      const user = userResult.rows[0];

      // Check if account is active
      if (!user.is_active) {
        // Record failed attempt
        await AuthRateLimit.recordAttempt(
          req.ip, 
          loginField, 
          false, 
          req.get('User-Agent')
        );

        return res.status(401).json({
          success: false,
          message: language === 'si' ? 'ගිණුම අක්‍රිය කර ඇත' :
                   language === 'ta' ? 'கணக்கு செயலிழக்கப்பட்டுள்ளது' :
                   'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        // Record failed attempt
        await AuthRateLimit.recordAttempt(
          req.ip, 
          loginField, 
          false, 
          req.get('User-Agent')
        );

        // Log failed login attempt
        await db.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, success, error_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            user.id,
            'login_failed',
            'user',
            user.id,
            req.ip,
            req.get('User-Agent'),
            false,
            'Invalid password'
          ]
        );

        return res.status(401).json({
          success: false,
          message: language === 'si' ? 'වලංගු නොවන අක්තපත්‍ර' :
                   language === 'ta' ? 'தவறான சான்றுகள்' :
                   'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Record successful attempt
      await AuthRateLimit.recordAttempt(
        req.ip, 
        loginField, 
        true, 
        req.get('User-Agent')
      );

      // Generate tokens
      const tokens = jwtUtils.generateTokens({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        nic_number: user.nic_number,
        role: 'citizen'
      });

      // Log successful login
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, success)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.id,
          'login_success',
          'user',
          user.id,
          req.ip,
          req.get('User-Agent'),
          true
        ]
      );

      // Create session record for additional tracking
      try {
        await db.query(
          `INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            user.id,
            tokens.accessToken.substring(0, 50), // Store partial token for tracking
            req.ip,
            req.get('User-Agent'),
            new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          ]
        );
      } catch (sessionError) {
        console.error('Session creation error:', sessionError);
        // Don't fail login if session creation fails
      }

      // Prepare response
      const response = {
        success: true,
        message: language === 'si' ? 'පිවිසීම සාර්ථකයි' :
                 language === 'ta' ? 'உள்நுழைவு வெற்றிகரமானது' :
                 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            nicNumber: user.nic_number,
            phoneNumber: user.phone_number,
            preferredLanguage: user.preferred_language,
            isActive: user.is_active,
            emailVerified: user.email_verified || false,
            phoneVerified: user.phone_verified || false,
            loginMethod: isEmailLogin ? 'email' : 'phone'
          },
          tokens,
          sessionInfo: {
            loginTime: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        }
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed due to server error',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(req, res) {
    try {
      // Validate request body
      const { error, value } = refreshTokenSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          code: 'VALIDATION_ERROR'
        });
      }

      const { refreshToken } = value;

      // Verify refresh token
      const decoded = jwtUtils.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      // Get current user data
      const userQuery = `
        SELECT id, email, first_name, last_name, nic_number, is_active
        FROM users 
        WHERE id = $1
      `;
      
      const userResult = await db.query(userQuery, [decoded.id]);

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        return res.status(401).json({
          success: false,
          message: 'User not found or account deactivated',
          code: 'USER_NOT_FOUND'
        });
      }

      const user = userResult.rows[0];

      // Generate new tokens
      const tokens = jwtUtils.generateTokens({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        nic_number: user.nic_number,
        role: 'citizen'
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens }
      });

    } catch (error) {
      console.error('Token refresh error:', error);

      if (error.message === 'Token expired') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_TOKEN'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const userQuery = `
        SELECT id, email, first_name, last_name, nic_number, phone_number,
               preferred_language, address, date_of_birth, profile_image_url,
               is_active, email_verified, phone_verified, created_at, updated_at
        FROM users 
        WHERE id = $1
      `;
      
      const userResult = await db.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      const user = userResult.rows[0];

      // Get NIC details
      const nicDetails = NICValidator.extractPersonalInfo(user.nic_number, user.preferred_language);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            nicNumber: user.nic_number,
            phoneNumber: user.phone_number,
            preferredLanguage: user.preferred_language,
            address: user.address,
            dateOfBirth: user.date_of_birth,
            profileImageUrl: user.profile_image_url,
            isActive: user.is_active,
            emailVerified: user.email_verified,
            phoneVerified: user.phone_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            nicDetails
          }
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Enhanced logout user with token blacklisting
   * Invalidates JWT token and clears server-side session data
   */
  static async logout(req, res) {
    try {
      const token = req.token; // Token from auth middleware
      const user = req.user;
      const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';

      // Decode token to get expiration time
      const decoded = jwtUtils.decodeToken(token);
      const expiresAt = new Date(decoded.exp * 1000);

      // Add token to blacklist
      const blacklistResult = await TokenBlacklist.addToken(
        token, 
        user.id, 
        expiresAt, 
        'logout'
      );

      if (!blacklistResult) {
        console.warn(`⚠️ Failed to blacklist token for user ${user.id}`);
        // Continue with logout even if blacklisting fails
      }

      // Deactivate user sessions
      try {
        await db.query(
          `UPDATE user_sessions 
           SET is_active = FALSE, last_activity = NOW()
           WHERE user_id = $1 AND is_active = TRUE`,
          [user.id]
        );
      } catch (sessionError) {
        console.error('Session deactivation error:', sessionError);
        // Continue with logout
      }

      // Log successful logout
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, success, new_values)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user.id,
          'logout',
          'user',
          user.id,
          req.ip,
          req.get('User-Agent'),
          true,
          JSON.stringify({
            tokenBlacklisted: blacklistResult,
            logoutTime: new Date(),
            sessionsClosed: true
          })
        ]
      );

      const response = {
        success: true,
        message: language === 'si' ? 'සාර්ථකව ඉවත් වී ඇත' :
                 language === 'ta' ? 'வெற்றிகரமாக வெளியேறியது' :
                 'Logged out successfully',
        data: {
          logoutTime: new Date(),
          tokenInvalidated: blacklistResult,
          sessionsClosed: true
        }
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Logout error:', error);
      
      // Log failed logout attempt
      try {
        await db.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, success, error_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            req.user?.id || null,
            'logout_failed',
            'user',
            req.user?.id || null,
            req.ip,
            req.get('User-Agent'),
            false,
            error.message
          ]
        );
      } catch (logError) {
        console.error('Failed to log logout error:', logError);
      }

      res.status(500).json({
        success: false,
        message: 'Logout failed due to server error',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Global logout - invalidate all user sessions and tokens
   */
  static async globalLogout(req, res) {
    try {
      const user = req.user;
      const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';

      // Perform global logout (invalidates all tokens issued before this time)
      const globalLogoutResult = await TokenBlacklist.blacklistAllUserTokens(
        user.id, 
        'global_logout'
      );

      // Deactivate all user sessions
      try {
        await db.query(
          `UPDATE user_sessions 
           SET is_active = FALSE, last_activity = NOW()
           WHERE user_id = $1 AND is_active = TRUE`,
          [user.id]
        );
      } catch (sessionError) {
        console.error('Global session deactivation error:', sessionError);
      }

      // Log global logout
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, success, new_values)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          user.id,
          'global_logout',
          'user',
          user.id,
          req.ip,
          req.get('User-Agent'),
          true,
          JSON.stringify({
            globalLogoutTime: new Date(),
            allSessionsClosed: true,
            allTokensInvalidated: true
          })
        ]
      );

      const response = {
        success: true,
        message: language === 'si' ? 'සියලුම උපකරණවලින් ඉවත් විය' :
                 language === 'ta' ? 'அனைத்து சாதனங்களிலிருந்தும் வெளியேறியது' :
                 'Logged out from all devices successfully',
        data: {
          globalLogoutTime: new Date(),
          allTokensInvalidated: true,
          allSessionsClosed: true
        }
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Global logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Global logout failed due to server error',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}

module.exports = AuthController;
