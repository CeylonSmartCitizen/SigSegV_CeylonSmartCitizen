const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwtUtils = require('../utils/jwt');
const NICValidator = require('../utils/nicValidator');
const TokenBlacklist = require('../utils/tokenBlacklist');
const AuthRateLimit = require('../utils/authRateLimit');
const UserDB = require('../utils/userDB');
const UserPreferences = require('../utils/userPreferences');
const PasswordSecurity = require('../utils/passwordSecurity');
const InputValidator = require('../utils/inputValidator');
const db = require('../config/database');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema
} = require('../validation/authValidation');

class AuthController {
  /**
   * User registration with comprehensive security and validation
   */
  static async register(req, res) {
    try {
      // Get language preference from request
      const language = req.body.preferredLanguage || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
      
      // Comprehensive input validation and sanitization
      const validationResult = InputValidator.validateUserRegistration(req.body, language);
      
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.errors,
          fieldValidations: validationResult.fieldValidations
        });
      }

      const sanitizedData = validationResult.sanitizedData;

      // Validate password strength
      const passwordValidation = PasswordSecurity.validatePasswordStrength(req.body.password, language);
      
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.error,
          suggestions: passwordValidation.suggestions,
          score: passwordValidation.score,
          field: 'password'
        });
      }

      // Additional NIC validation with database check
      const nicValidation = await NICValidator.validateWithDatabaseCheck(
        sanitizedData.nicNumber,
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

      // Hash password securely
      const hashedPassword = await PasswordSecurity.hashPassword(req.body.password);

      // Extract birth date from NIC if not provided
      const finalBirthDate = req.body.dateOfBirth || sanitizedData.nicDetails.birthDate;

      // Create user using UserDB utility with sanitized and validated data
      const userData = {
        email: sanitizedData.email,
        password: hashedPassword,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        nicNumber: sanitizedData.nicNumber,
        phoneNumber: sanitizedData.phoneNumber,
        preferredLanguage: sanitizedData.preferredLanguage || 'en',
        address: sanitizedData.address,
        dateOfBirth: finalBirthDate,
        gender: sanitizedData.nicDetails.gender
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
   * Change user password with enhanced security validation
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';

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

      // Validate new password strength
      const passwordValidation = PasswordSecurity.validatePasswordStrength(newPassword, language);
      
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.error,
          suggestions: passwordValidation.suggestions,
          score: passwordValidation.score,
          field: 'newPassword'
        });
      }

      // Get current user data
      const currentUser = await UserDB.findUserById(userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordSecurity.comparePassword(currentPassword, currentUser.password_hash);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: language === 'si' ? 'වර්තමාන මුරපදය වැරදියි' :
                   language === 'ta' ? 'தற்போதைய கடவுச்சொல் தவறானது' :
                   'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD',
          field: 'currentPassword'
        });
      }

      // Hash new password
      const hashedNewPassword = await PasswordSecurity.hashPassword(newPassword);

      // Update password in database
      const passwordResult = await UserDB.updateUserPassword(userId, hashedNewPassword);

      if (!passwordResult.success) {
        return res.status(500).json({
          success: false,
          message: passwordResult.message,
          code: passwordResult.error
        });
      }

      // Prepare response
      const response = {
        success: true,
        message: language === 'si' ? 'මුරපදය සාර්ථකව වෙනස් කරන ලදී' :
                 language === 'ta' ? 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது' :
                 'Password changed successfully',
        data: {
          passwordStrengthScore: passwordValidation.score,
          securityMessage: language === 'si' ? 'ඔබගේ නව මුරපදයෙන් නැවත පුරනය වන්න' :
                          language === 'ta' ? 'உங்கள் புதிய கடவுச்சொல்லுடன் மீண்டும் உள்நுழையவும்' :
                          'Please login again with your new password'
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
   * Save user language preference (specific endpoint for frontend)
   */
  static async saveUserLanguage(req, res) {
    try {
      const userId = req.user.userId;
      const { language } = req.body;

      // Validate language
      const supportedLanguages = ['en', 'si', 'ta'];
      if (!language || !supportedLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid language. Supported languages: en, si, ta',
          code: 'INVALID_LANGUAGE',
          field: 'language'
        });
      }

      // Update language preference
      const updateResult = await UserPreferences.updatePreference(
        userId, 
        'language_preference', 
        language
      );

      if (!updateResult.success) {
        return res.status(500).json({
          success: false,
          message: updateResult.message,
          code: updateResult.error
        });
      }

      // Also update user's preferred_language in users table for consistency
      try {
        await db.query(`
          UPDATE users 
          SET preferred_language = $1, updated_at = NOW()
          WHERE user_id = $2
        `, [language, userId]);
      } catch (dbError) {
        console.warn('Failed to update user preferred_language in users table:', dbError);
        // Don't fail the request, just log the warning
      }

      const response = {
        success: true,
        message: language === 'si' ? 'භාෂා මනාපය සාර්ථකව සුරකින ලදී' :
                 language === 'ta' ? 'மொழி விருப்பம் வெற்றிகரமாக சேமிக்கப்பட்டது' :
                 'Language preference saved successfully',
        data: {
          language: language,
          updated_at: new Date().toISOString(),
          message: language === 'si' ? 'පූර්ණ ප්‍රයෝගය සඳහා යෙදුම නැවත ආරම්භ කරන්න' :
                   language === 'ta' ? 'முழு அனுபவத்திற்காக பயன்பாட்டை மறுதொடக்கம் செய்யவும்' :
                   'You may want to restart the app for full effect'
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Save language error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save language preference',
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

  /**
   * Get active sessions for the authenticated user
   */
  static async getActiveSessions(req, res) {
    try {
      const SessionManager = require('../utils/sessionManager');
      const sessions = await SessionManager.getActiveSessions(req.user.user_id);

      res.json({
        success: true,
        data: {
          sessions: sessions.map(session => ({
            id: session.id,
            deviceInfo: session.device_info,
            ipAddress: session.ip_address,
            createdAt: session.created_at,
            lastActive: session.updated_at,
            expiresAt: session.expires_at,
            isCurrent: session.token_jti === req.user.jti
          })),
          totalSessions: sessions.length
        },
        message: 'Active sessions retrieved successfully'
      });

    } catch (error) {
      console.error('Get active sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve active sessions',
        code: 'SESSIONS_FETCH_ERROR'
      });
    }
  }

  /**
   * Logout a specific session
   */
  static async logoutSession(req, res) {
    try {
      const { sessionId } = req.params;
      const SessionManager = require('../utils/sessionManager');
      
      const loggedOutSession = await SessionManager.logoutSession(sessionId, req.user.user_id);
      
      if (!loggedOutSession) {
        return res.status(404).json({
          success: false,
          message: 'Session not found or already logged out',
          code: 'SESSION_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        message: 'Session logged out successfully',
        data: {
          sessionId: loggedOutSession.id,
          loggedOutAt: new Date()
        }
      });

    } catch (error) {
      console.error('Logout session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout session',
        code: 'SESSION_LOGOUT_ERROR'
      });
    }
  }

  /**
   * Logout all sessions for the authenticated user
   */
  static async logoutAllSessions(req, res) {
    try {
      const SessionManager = require('../utils/sessionManager');
      const result = await SessionManager.logoutAllSessions(req.user.user_id);

      res.json({
        success: true,
        message: 'All sessions logged out successfully',
        data: {
          loggedOutSessions: result.loggedOutSessions,
          timestamp: result.timestamp
        }
      });

    } catch (error) {
      console.error('Logout all sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout all sessions',
        code: 'ALL_SESSIONS_LOGOUT_ERROR'
      });
    }
  }

  /**
   * Deactivate user account
   */
  static async deactivateAccount(req, res) {
    try {
      const { reason, password } = req.body;
      const userId = req.user.user_id;

      // Verify password before deactivation
      const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);
      
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Invalid password',
          code: 'INVALID_PASSWORD'
        });
      }

      // Create deactivation request
      const deactivationQuery = `
        INSERT INTO user_deactivation_requests (
          user_id, reason, ip_address, user_agent, status
        ) VALUES ($1, $2, $3, $4, 'pending')
        RETURNING id, requested_at
      `;

      const deactivationResult = await db.query(deactivationQuery, [
        userId,
        reason || 'User requested account deactivation',
        req.ip,
        req.get('User-Agent')
      ]);

      // Immediately deactivate the account
      await db.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);

      // Logout all sessions
      const SessionManager = require('../utils/sessionManager');
      await SessionManager.logoutAllSessions(userId);

      res.json({
        success: true,
        message: 'Account deactivation request submitted and processed',
        data: {
          requestId: deactivationResult.rows[0].id,
          requestedAt: deactivationResult.rows[0].requested_at,
          status: 'Account deactivated successfully'
        }
      });

    } catch (error) {
      console.error('Account deactivation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate account',
        code: 'ACCOUNT_DEACTIVATION_ERROR'
      });
    }
  }

  /**
   * Export user data for GDPR compliance
   */
  static async exportUserData(req, res) {
    try {
      const DataExporter = require('../utils/dataExporter');
      const exportResult = await DataExporter.exportUserData(req.user.user_id);

      // Log the export request
      await DataExporter.logExportRequest(
        req.user.user_id,
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'User data exported successfully',
        data: exportResult.data,
        metadata: {
          exportedAt: exportResult.data.metadata.exportedAt,
          dataSize: exportResult.dataSize,
          recordCount: exportResult.recordCount
        }
      });

    } catch (error) {
      console.error('Data export error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export user data',
        code: 'DATA_EXPORT_ERROR'
      });
    }
  }

  /**
   * Setup Two-Factor Authentication
   */
  static async setupTwoFactor(req, res) {
    try {
      const TwoFactorAuth = require('../utils/twoFactorAuth');
      const setupResult = await TwoFactorAuth.setupTwoFactor(req.user.user_id);

      res.json({
        success: true,
        message: setupResult.message,
        data: {
          secret: setupResult.secret,
          qrCodeData: setupResult.qrCodeData,
          backupCodes: setupResult.backupCodes
        }
      });

    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to setup two-factor authentication',
        code: 'TWO_FACTOR_SETUP_ERROR'
      });
    }
  }

  /**
   * Verify Two-Factor Authentication code
   */
  static async verifyTwoFactor(req, res) {
    try {
      const { code } = req.body;
      
      if (!code || code.length !== 6) {
        return res.status(400).json({
          success: false,
          message: 'Valid 6-digit verification code is required',
          code: 'INVALID_CODE_FORMAT'
        });
      }

      const TwoFactorAuth = require('../utils/twoFactorAuth');
      const verificationResult = await TwoFactorAuth.verifyTwoFactor(req.user.user_id, code);

      res.json({
        success: true,
        message: verificationResult.message,
        data: {
          timestamp: verificationResult.timestamp
        }
      });

    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to verify two-factor authentication',
        code: 'TWO_FACTOR_VERIFICATION_ERROR'
      });
    }
  }

  /**
   * Disable Two-Factor Authentication
   */
  static async disableTwoFactor(req, res) {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to disable two-factor authentication',
          code: 'PASSWORD_REQUIRED'
        });
      }

      const TwoFactorAuth = require('../utils/twoFactorAuth');
      const disableResult = await TwoFactorAuth.disableTwoFactor(req.user.user_id, password);

      res.json({
        success: true,
        message: disableResult.message,
        data: {
          timestamp: disableResult.timestamp
        }
      });

    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to disable two-factor authentication',
        code: 'TWO_FACTOR_DISABLE_ERROR'
      });
    }
  }

  /**
   * Forgot Password - Send password reset email/SMS
   */
  static async forgotPassword(req, res) {
    try {
      const { identifier } = req.body; // Can be email, phone, or NIC
      const language = req.body.language || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';

      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: 'Email, phone number, or NIC is required',
          code: 'IDENTIFIER_REQUIRED'
        });
      }

      // Find user by email, phone, or NIC
      let userQuery;
      let queryParam;

      if (identifier.includes('@')) {
        userQuery = 'SELECT id, email, phone_number, first_name, preferred_language FROM users WHERE email = $1 AND is_active = true';
        queryParam = identifier.toLowerCase().trim();
      } else if (identifier.match(/^\+?[0-9\s\-()]+$/)) {
        userQuery = 'SELECT id, email, phone_number, first_name, preferred_language FROM users WHERE phone_number = $1 AND is_active = true';
        queryParam = identifier.replace(/\s/g, '');
      } else {
        userQuery = 'SELECT id, email, phone_number, first_name, preferred_language FROM users WHERE nic_number = $1 AND is_active = true';
        queryParam = identifier.toUpperCase().trim();
      }

      const userResult = await db.query(userQuery, [queryParam]);

      // Always return success for security (don't reveal if user exists)
      const successResponse = {
        success: true,
        message: language === 'si' 
          ? 'රහස්කේතය නැවත සැකසීමේ උපදෙස් යවා ඇත'
          : language === 'ta'
          ? 'கடவுச்சொல் மீட்டமைப்பு வழிமுறைகள் அனுப்பப்பட்டுள்ளன'
          : 'Password reset instructions have been sent',
        code: 'RESET_INSTRUCTIONS_SENT'
      };

      if (userResult.rows.length === 0) {
        // User not found, but return success for security
        return res.json(successResponse);
      }

      const user = userResult.rows[0];

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store reset token in database
      const updateQuery = `
        UPDATE users 
        SET reset_token = $1, reset_token_expires = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `;

      await db.query(updateQuery, [resetToken, resetTokenExpiry, user.id]);

      // Log password reset request
      const logQuery = `
        INSERT INTO password_reset_requests (
          user_id, reset_token, requested_at, expires_at, ip_address, user_agent
        ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)
      `;

      await db.query(logQuery, [
        user.id,
        resetToken,
        resetTokenExpiry,
        req.ip,
        req.get('User-Agent')
      ]);

      // In a real implementation, you would send email/SMS here
      // For now, we'll log the reset information
      console.log(`Password reset requested for user ${user.id}`);
      console.log(`Reset token: ${resetToken}`);
      console.log(`Reset URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);

      // Simulate sending notification
      const notificationData = {
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`,
        userFirstName: user.first_name,
        expiryTime: '15 minutes',
        userEmail: user.email,
        userPhone: user.phone_number
      };

      // TODO: Integrate with email/SMS service
      // await EmailService.sendPasswordResetEmail(notificationData);
      // await SMSService.sendPasswordResetSMS(notificationData);

      return res.json(successResponse);

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
        code: 'RESET_REQUEST_ERROR'
      });
    }
  }

  /**
   * Reset Password - Reset password using token
   */
  static async resetPassword(req, res) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      const language = req.body.language || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';

      // Validate input
      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: language === 'si' 
            ? 'සියලුම ක්ෂේත්‍ර අවශ්‍ය වේ'
            : language === 'ta'
            ? 'அனைத்து புலங்களும் தேவை'
            : 'All fields are required',
          code: 'MISSING_FIELDS'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: language === 'si' 
            ? 'රහස්කේත නොගැලපේ'
            : language === 'ta'
            ? 'கடவுச்சொற்கள் பொருந்தவில்லை'
            : 'Passwords do not match',
          code: 'PASSWORD_MISMATCH'
        });
      }

      // Validate password strength
      const passwordValidation = PasswordSecurity.validatePasswordStrength(newPassword, language);
      
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.error,
          suggestions: passwordValidation.suggestions,
          score: passwordValidation.score,
          code: 'WEAK_PASSWORD'
        });
      }

      // Find user with valid reset token
      const userQuery = `
        SELECT id, email, first_name, preferred_language, reset_token_expires
        FROM users 
        WHERE reset_token = $1 
          AND reset_token_expires > CURRENT_TIMESTAMP 
          AND is_active = true
      `;

      const userResult = await db.query(userQuery, [token]);

      if (userResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: language === 'si' 
            ? 'අවලංගු හෝ කල් ඉකුත් වූ ටෝකනය'
            : language === 'ta'
            ? 'தவறான அல்லது காலாவधி முடிந்த டோக்கன்'
            : 'Invalid or expired reset token',
          code: 'INVALID_TOKEN'
        });
      }

      const user = userResult.rows[0];

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      const updateQuery = `
        UPDATE users 
        SET password_hash = $1, 
            reset_token = NULL, 
            reset_token_expires = NULL, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      await db.query(updateQuery, [hashedPassword, user.id]);

      // Log successful password reset
      const logQuery = `
        UPDATE password_reset_requests 
        SET completed_at = CURRENT_TIMESTAMP, status = 'completed'
        WHERE reset_token = $1
      `;

      await db.query(logQuery, [token]);

      // Invalidate all existing sessions for security
      const SessionManager = require('../utils/sessionManager');
      await SessionManager.logoutAllSessions(user.id);

      // Add to token blacklist for extra security
      await TokenBlacklist.addToken(token);

      res.json({
        success: true,
        message: language === 'si' 
          ? 'රහස්කේතය සාර්ථකව නැවත සකසන ලදී'
          : language === 'ta'
          ? 'கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது'
          : 'Password reset successfully',
        data: {
          timestamp: new Date(),
          loggedOutAllSessions: true
        }
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        code: 'RESET_PASSWORD_ERROR'
      });
    }
  }
}

module.exports = AuthController;
