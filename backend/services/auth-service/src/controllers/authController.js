const bcrypt = require('bcryptjs');
const jwtUtils = require('../utils/jwt');
const NICValidator = require('../utils/nicValidator');
const TokenBlacklist = require('../utils/tokenBlacklist');
const AuthRateLimit = require('../utils/authRateLimit');
const UserDB = require('../utils/userDB');
const UserPreferences = require('../utils/userPreferences');
const db = require('../config/database');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema
} = require('../validation/authValidation');

class AuthController {
  /**
   * User registration with comprehensive database integration
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

      // Extract birth date from NIC if not provided
      const finalBirthDate = dateOfBirth || nicValidation.details.birthDate;

      // Create user using UserDB utility
      const userData = {
        email,
        password,
        firstName,
        lastName,
        nicNumber: nicValidation.details.formattedNIC,
        phoneNumber,
        preferredLanguage: preferredLanguage || 'en',
        address,
        dateOfBirth: finalBirthDate
      };

      const userResult = await UserDB.createUser(userData);

      if (!userResult.success) {
        const messages = NICValidator.ERROR_MESSAGES[language] || NICValidator.ERROR_MESSAGES.en;
        
        let message = userResult.message;
        if (userResult.error === 'EMAIL_EXISTS') {
          message = language === 'si' ? 'මෙම ඊ-මේල් ලිපිනය දැනටමත් ලියාපදිංචි කර ඇත' :
                   language === 'ta' ? 'இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது' :
                   'This email address is already registered';
        } else if (userResult.error === 'NIC_EXISTS') {
          message = language === 'si' ? 'මෙම ජාතික හැඳුනුම්පත් අංකය දැනටමත් ලියාපදිංචි කර ඇත' :
                   language === 'ta' ? 'இந்த தேசிய அடையாள எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது' :
                   'This NIC number is already registered';
        }

        return res.status(400).json({
          success: false,
          message,
          code: userResult.error,
          field: userResult.error === 'EMAIL_EXISTS' ? 'email' : 'nicNumber'
        });
      }

      const newUser = userResult.user;

      // Initialize default user preferences
      await UserPreferences.initializeDefaultPreferences(newUser.id);

      // Generate JWT tokens
      const tokens = await jwtUtils.generateTokens({
        userId: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        nic_number: newUser.nic_number,
        role: 'citizen'
      });

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

      const language = req.body.preferredLanguage || 'en';
      res.status(500).json({
        success: false,
        message: language === 'si' ? 'ලියාපදිංචි කිරීමේ දෝෂයක්' :
                 language === 'ta' ? 'பதிவு செய்வதில் பிழை' :
                 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  }

  /**
   * Enhanced user login with comprehensive database integration
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
      const identifier = email || phone;

      // Check rate limiting before processing login
      const rateLimitCheck = await AuthRateLimit.checkRateLimit(
        req.ip,
        identifier,
        'login'
      );

      if (!rateLimitCheck.allowed) {
        // Log rate limit hit
        await AuthRateLimit.recordAttempt(
          req.ip,
          identifier,
          false,
          'rate_limit_exceeded',
          req.get('User-Agent')
        );

        return res.status(429).json({
          success: false,
          message: language === 'si' ? 'ඉතා වැඩි උත්සාහයන් සිදු කර ඇත. කරුණාකර පසුව උත්සාහ කරන්න' :
                   language === 'ta' ? 'மிக அதிகமான முயற்சிகள். தயவுசெய்து பின்னர் முயற்சிக்கவும்' :
                   'Too many attempts. Please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: rateLimitCheck.retryAfter
        });
      }

      // Verify user credentials using UserDB
      const credentialResult = await UserDB.verifyUserCredentials(identifier, password);

      if (!credentialResult.success) {
        // Log failed attempt
        await AuthRateLimit.recordAttempt(
          req.ip,
          identifier,
          false,
          credentialResult.error,
          req.get('User-Agent')
        );

        const errorMessage = credentialResult.error === 'USER_DEACTIVATED' ?
          (language === 'si' ? 'ගිණුම අක්‍රිය කර ඇත' :
           language === 'ta' ? 'கணக்கு செயலிழக்கப்பட்டுள்ளது' :
           'Account has been deactivated') :
          (language === 'si' ? 'වැරදි පුරනය තොරතුරු' :
           language === 'ta' ? 'தவறான உள்நुழைவு விவரங்கள்' :
           'Invalid credentials');

        return res.status(401).json({
          success: false,
          message: errorMessage,
          code: credentialResult.error
        });
      }

      const user = credentialResult.user;
      const loginMethod = credentialResult.loginMethod;

      // Generate JWT tokens
      const tokens = await jwtUtils.generateTokens({
        userId: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        nic_number: user.nic_number,
        role: 'citizen'
      });

      // Log successful login attempt
      await AuthRateLimit.recordAttempt(
        req.ip,
        identifier,
        true,
        'login_success',
        req.get('User-Agent')
      );

      // Prepare response
      const response = {
        success: true,
        message: language === 'si' ? 'පුරනය සාර්ථකයි' :
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
            loginMethod: loginMethod,
            isActive: user.is_active,
            emailVerified: user.email_verified,
            phoneVerified: user.phone_verified
          },
          tokens
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Login error:', error);
      
      const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
      res.status(500).json({
        success: false,
        message: language === 'si' ? 'පුරනය අසාර්ථකයි' :
                 language === 'ta' ? 'உள்நுழைவு தோல்வியடைந்தது' :
                 'Login failed',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Enhanced user profile retrieval with preferences
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;

      // Get complete user profile with preferences using UserDB
      const userProfile = await UserDB.getUserProfileWithPreferences(userId);

      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Get user activity statistics
      const activityStats = await UserDB.getUserActivityStats(userId, 30);

      // Prepare response
      const response = {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: userProfile.id,
            email: userProfile.email,
            firstName: userProfile.first_name,
            lastName: userProfile.last_name,
            nicNumber: userProfile.nic_number,
            phoneNumber: userProfile.phone_number,
            preferredLanguage: userProfile.preferred_language,
            profileImageUrl: userProfile.profile_image_url,
            dateOfBirth: userProfile.date_of_birth,
            address: userProfile.address,
            isActive: userProfile.is_active,
            emailVerified: userProfile.email_verified,
            phoneVerified: userProfile.phone_verified,
            createdAt: userProfile.created_at,
            updatedAt: userProfile.updated_at
          },
          preferences: userProfile.preferences || UserPreferences.getDefaultPreferences(),
          statistics: {
            ...userProfile.statistics,
            activityStats
          }
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Update user profile with database integration
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const updateData = req.body;

      // Update user profile using UserDB
      const updateResult = await UserDB.updateUserProfile(userId, updateData);

      if (!updateResult.success) {
        return res.status(400).json({
          success: false,
          message: updateResult.message,
          code: updateResult.error
        });
      }

      // Prepare response
      const response = {
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updateResult.user.id,
            email: updateResult.user.email,
            firstName: updateResult.user.first_name,
            lastName: updateResult.user.last_name,
            nicNumber: updateResult.user.nic_number,
            phoneNumber: updateResult.user.phone_number,
            preferredLanguage: updateResult.user.preferred_language,
            profileImageUrl: updateResult.user.profile_image_url,
            dateOfBirth: updateResult.user.date_of_birth,
            address: updateResult.user.address,
            isActive: updateResult.user.is_active,
            emailVerified: updateResult.user.email_verified,
            phoneVerified: updateResult.user.phone_verified,
            updatedAt: updateResult.user.updated_at
          }
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Change password with database integration
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.userId;

      // Validate request body
      const { error, value } = changePasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      const { currentPassword, newPassword } = value;

      // Update password using UserDB
      const passwordResult = await UserDB.updatePassword(userId, newPassword, currentPassword);

      if (!passwordResult.success) {
        return res.status(400).json({
          success: false,
          message: passwordResult.message,
          code: passwordResult.error
        });
      }

      // Prepare response
      const response = {
        success: true,
        message: 'Password changed successfully',
        data: {
          forceLogout: passwordResult.forceLogout,
          message: 'Please login again with your new password'
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Enhanced logout with token blacklisting
   */
  static async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = req.user.userId;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'No token provided',
          code: 'NO_TOKEN'
        });
      }

      // Decode token to get expiration time
      const decoded = jwtUtils.verifyToken(token);
      const expiresAt = new Date(decoded.exp * 1000);

      // Add token to blacklist
      const blacklistResult = await TokenBlacklist.addToken(
        token,
        userId,
        expiresAt,
        'logout'
      );

      if (!blacklistResult) {
        return res.status(500).json({
          success: false,
          message: 'Failed to logout',
          code: 'LOGOUT_FAILED'
        });
      }

      // Prepare response
      const response = {
        success: true,
        message: 'Logout successful',
        data: {
          tokenInvalidated: true,
          logoutTime: new Date()
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Global logout - invalidate all user sessions
   */
  static async globalLogout(req, res) {
    try {
      const userId = req.user.userId;

      // Blacklist all user tokens using TokenBlacklist
      const globalLogoutResult = await TokenBlacklist.blacklistAllUserTokens(
        userId,
        'global_logout'
      );

      if (!globalLogoutResult) {
        return res.status(500).json({
          success: false,
          message: 'Failed to perform global logout',
          code: 'GLOBAL_LOGOUT_FAILED'
        });
      }

      // Prepare response
      const response = {
        success: true,
        message: 'Global logout successful',
        data: {
          allSessionsInvalidated: true,
          globalLogoutTime: new Date()
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Global logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Global logout failed',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * User preferences management
   */
  static async getUserPreferences(req, res) {
    try {
      const userId = req.user.userId;

      const preferences = await UserPreferences.getUserPreferences(userId);

      const response = {
        success: true,
        message: 'Preferences retrieved successfully',
        data: {
          preferences: preferences || UserPreferences.getDefaultPreferences()
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve preferences',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(req, res) {
    try {
      const userId = req.user.userId;
      const preferences = req.body;

      const updateResult = await UserPreferences.setUserPreferences(userId, preferences);

      if (!updateResult.success) {
        return res.status(400).json({
          success: false,
          message: updateResult.message,
          code: updateResult.error
        });
      }

      const response = {
        success: true,
        message: 'Preferences updated successfully',
        data: {
          preferences: updateResult.preferences
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Refresh JWT tokens
   */
  static async refreshToken(req, res) {
    try {
      const { error, value } = refreshTokenSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'VALIDATION_ERROR'
        });
      }

      const { refreshToken } = value;

      try {
        const decoded = jwtUtils.verifyRefreshToken(refreshToken);
        
        // Check if user still exists and is active
        const user = await UserDB.findUserById(decoded.userId);
        if (!user || !user.is_active) {
          return res.status(401).json({
            success: false,
            message: 'User not found or inactive',
            code: 'USER_INVALID'
          });
        }

        // Generate new tokens
        const tokens = await jwtUtils.generateTokens({
          userId: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          nic_number: user.nic_number,
          role: 'citizen'
        });

        res.json({
          success: true,
          message: 'Tokens refreshed successfully',
          data: {
            tokens
          }
        });

      } catch (tokenError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}

module.exports = AuthController;
