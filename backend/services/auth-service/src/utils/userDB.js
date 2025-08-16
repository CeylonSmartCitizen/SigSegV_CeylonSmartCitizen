const db = require('../config/database');
const bcrypt = require('bcryptjs');
const PasswordSecurity = require('./passwordSecurity');
const { v4: uuidv4 } = require('uuid');

/**
 * User Database Operations
 * Comprehensive database integration for user management
 */
class UserDB {
  /**
   * Create user registration with all required fields
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user data (without password)
   */
  static async createUser(userData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      const {
        email,
        phoneNumber,
        firstName,
        lastName,
        nicNumber,
        password, // This should already be hashed when passed from controller
        preferredLanguage = 'en',
        profileImageUrl = null,
        dateOfBirth = null,
        address = null
      } = userData;

      // Password should already be hashed by PasswordSecurity.hashPassword() in controller
      // No additional hashing needed here
      const passwordHash = password;

      // Generate UUID
      const userId = uuidv4();

      const query = `
        INSERT INTO users (
          id, email, phone_number, first_name, last_name, nic_number, 
          password_hash, preferred_language, profile_image_url, 
          date_of_birth, address, is_active, email_verified, phone_verified,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING 
          id, email, phone_number, first_name, last_name, nic_number,
          preferred_language, profile_image_url, date_of_birth, address,
          is_active, email_verified, phone_verified, created_at, updated_at
      `;

      const values = [
        userId,
        email.toLowerCase().trim(),
        phoneNumber,
        firstName.trim(),
        lastName.trim(),
        nicNumber.toUpperCase().trim(),
        passwordHash,
        preferredLanguage,
        profileImageUrl,
        dateOfBirth,
        address,
        true, // is_active
        false, // email_verified
        false // phone_verified
      ];

      const result = await client.query(query, values);
      const newUser = result.rows[0];

      // Log user creation
      await this.logUserActivity(client, userId, 'user_created', {
        email,
        firstName,
        lastName,
        registrationMethod: 'standard'
      });

      await client.query('COMMIT');
      
      console.log(`✅ User created successfully: ${email}`);
      return {
        success: true,
        user: newUser,
        message: 'User registered successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      
      // Handle unique constraint violations
      if (error.code === '23505') {
        if (error.constraint === 'users_email_key') {
          return {
            success: false,
            error: 'EMAIL_EXISTS',
            message: 'Email address already registered'
          };
        } else if (error.constraint === 'users_nic_number_key') {
          return {
            success: false,
            error: 'NIC_EXISTS',
            message: 'NIC number already registered'
          };
        }
      }

      console.error('❌ Error creating user:', error);
      return {
        success: false,
        error: 'CREATION_FAILED',
        message: 'Failed to create user account'
      };
    } finally {
      client.release();
    }
  }

  /**
   * Find user by email address
   * @param {string} email - Email address
   * @param {boolean} includePassword - Whether to include password hash
   * @returns {Promise<Object|null>} User data or null
   */
  static async findUserByEmail(email, includePassword = false) {
    try {
      const fields = includePassword ? 
        'id, email, phone_number, first_name, last_name, nic_number, password_hash, preferred_language, profile_image_url, date_of_birth, address, is_active, email_verified, phone_verified, global_logout_time, created_at, updated_at' :
        'id, email, phone_number, first_name, last_name, nic_number, preferred_language, profile_image_url, date_of_birth, address, is_active, email_verified, phone_verified, global_logout_time, created_at, updated_at';

      const query = `SELECT ${fields} FROM users WHERE email = $1`;
      const result = await db.query(query, [email.toLowerCase().trim()]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      
      // Log lookup activity
      await this.logUserActivity(null, user.id, 'user_lookup', {
        lookupMethod: 'email',
        email: email
      });

      return user;
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Find user by phone number
   * @param {string} phoneNumber - Phone number
   * @param {boolean} includePassword - Whether to include password hash
   * @returns {Promise<Object|null>} User data or null
   */
  static async findUserByPhone(phoneNumber, includePassword = false) {
    try {
      const fields = includePassword ? 
        'id, email, phone_number, first_name, last_name, nic_number, password_hash, preferred_language, profile_image_url, date_of_birth, address, is_active, email_verified, phone_verified, global_logout_time, created_at, updated_at' :
        'id, email, phone_number, first_name, last_name, nic_number, preferred_language, profile_image_url, date_of_birth, address, is_active, email_verified, phone_verified, global_logout_time, created_at, updated_at';

      const query = `SELECT ${fields} FROM users WHERE phone_number = $1`;
      const result = await db.query(query, [phoneNumber.trim()]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      
      // Log lookup activity
      await this.logUserActivity(null, user.id, 'user_lookup', {
        lookupMethod: 'phone',
        phoneNumber: phoneNumber
      });

      return user;
    } catch (error) {
      console.error('❌ Error finding user by phone:', error);
      return null;
    }
  }

  /**
   * Find user by NIC number
   * @param {string} nicNumber - NIC number
   * @param {boolean} includePassword - Whether to include password hash
   * @returns {Promise<Object|null>} User data or null
   */
  static async findUserByNIC(nicNumber, includePassword = false) {
    try {
      const fields = includePassword ? 
        'id, email, phone_number, first_name, last_name, nic_number, password_hash, preferred_language, profile_image_url, date_of_birth, address, is_active, email_verified, phone_verified, global_logout_time, created_at, updated_at' :
        'id, email, phone_number, first_name, last_name, nic_number, preferred_language, profile_image_url, date_of_birth, address, is_active, email_verified, phone_verified, global_logout_time, created_at, updated_at';

      const query = `SELECT ${fields} FROM users WHERE nic_number = $1`;
      const result = await db.query(query, [nicNumber.toUpperCase().trim()]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      
      // Log lookup activity
      await this.logUserActivity(null, user.id, 'user_lookup', {
        lookupMethod: 'nic',
        nicNumber: nicNumber
      });

      return user;
    } catch (error) {
      console.error('❌ Error finding user by NIC:', error);
      return null;
    }
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @param {boolean} includePassword - Whether to include password hash
   * @returns {Promise<Object|null>} User data or null
   */
  static async findUserById(userId, includePassword = false) {
    try {
      const fields = includePassword ? 
        'id, email, phone_number, first_name, last_name, nic_number, password_hash, preferred_language, profile_image_url, date_of_birth, address, is_active, email_verified, phone_verified, global_logout_time, created_at, updated_at' :
        'id, email, phone_number, first_name, last_name, nic_number, preferred_language, profile_image_url, date_of_birth, address, is_active, email_verified, phone_verified, global_logout_time, created_at, updated_at';

      const query = `SELECT ${fields} FROM users WHERE id = $1`;
      const result = await db.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @param {string} oldPassword - Current password (for verification)
   * @returns {Promise<Object>} Update result
   */
  static async updatePassword(userId, newPassword, oldPassword = null) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // If old password provided, verify it first
      if (oldPassword) {
        const userQuery = 'SELECT password_hash FROM users WHERE id = $1';
        const userResult = await client.query(userQuery, [userId]);
        
        if (userResult.rows.length === 0) {
          return {
            success: false,
            error: 'USER_NOT_FOUND',
            message: 'User not found'
          };
        }

        const isValidOldPassword = await bcrypt.compare(oldPassword, userResult.rows[0].password_hash);
        if (!isValidOldPassword) {
          await this.logUserActivity(client, userId, 'password_change_failed', {
            reason: 'invalid_current_password'
          });
          
          return {
            success: false,
            error: 'INVALID_PASSWORD',
            message: 'Current password is incorrect'
          };
        }
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const updateQuery = `
        UPDATE users 
        SET password_hash = $1, updated_at = NOW()
        WHERE id = $2
      `;

      await client.query(updateQuery, [newPasswordHash, userId]);

      // Force global logout to invalidate all existing sessions
      await client.query(
        'UPDATE users SET global_logout_time = NOW() WHERE id = $1',
        [userId]
      );

      // Log password change
      await this.logUserActivity(client, userId, 'password_changed', {
        timestamp: new Date(),
        forceLogout: true
      });

      await client.query('COMMIT');

      console.log(`✅ Password updated for user: ${userId}`);
      return {
        success: true,
        message: 'Password updated successfully',
        forceLogout: true
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error updating password:', error);
      return {
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to update password'
      };
    } finally {
      client.release();
    }
  }

  /**
   * Activate user account
   * @param {string} userId - User ID
   * @param {string} activationType - Type of activation (email, phone, admin)
   * @returns {Promise<Object>} Activation result
   */
  static async activateUser(userId, activationType = 'admin') {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const updateFields = ['is_active = true', 'updated_at = NOW()'];
      const logData = { activationType };

      // Update specific verification status based on activation type
      if (activationType === 'email') {
        updateFields.push('email_verified = true');
        logData.emailVerified = true;
      } else if (activationType === 'phone') {
        updateFields.push('phone_verified = true');
        logData.phoneVerified = true;
      }

      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $1`;
      const result = await client.query(query, [userId]);

      if (result.rowCount === 0) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        };
      }

      // Log activation
      await this.logUserActivity(client, userId, 'user_activated', logData);

      await client.query('COMMIT');

      console.log(`✅ User activated: ${userId} (type: ${activationType})`);
      return {
        success: true,
        message: 'User activated successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error activating user:', error);
      return {
        success: false,
        error: 'ACTIVATION_FAILED',
        message: 'Failed to activate user'
      };
    } finally {
      client.release();
    }
  }

  /**
   * Deactivate user account
   * @param {string} userId - User ID
   * @param {string} reason - Reason for deactivation
   * @param {string} deactivatedBy - Who deactivated (admin ID or 'system')
   * @returns {Promise<Object>} Deactivation result
   */
  static async deactivateUser(userId, reason = 'admin_action', deactivatedBy = 'system') {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE users 
        SET is_active = false, global_logout_time = NOW(), updated_at = NOW()
        WHERE id = $1
      `;
      
      const result = await client.query(query, [userId]);

      if (result.rowCount === 0) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        };
      }

      // Log deactivation
      await this.logUserActivity(client, userId, 'user_deactivated', {
        reason,
        deactivatedBy,
        timestamp: new Date()
      });

      await client.query('COMMIT');

      console.log(`✅ User deactivated: ${userId} (reason: ${reason})`);
      return {
        success: true,
        message: 'User deactivated successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error deactivating user:', error);
      return {
        success: false,
        error: 'DEACTIVATION_FAILED',
        message: 'Failed to deactivate user'
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get user profile with preferences
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Complete user profile or null
   */
  static async getUserProfileWithPreferences(userId) {
    try {
      const userQuery = `
        SELECT 
          id, email, phone_number, first_name, last_name, nic_number,
          preferred_language, profile_image_url, date_of_birth, address,
          is_active, email_verified, phone_verified, created_at, updated_at
        FROM users 
        WHERE id = $1
      `;

      const userResult = await db.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        return null;
      }

      const user = userResult.rows[0];

      // Get user preferences (if they exist)
      const preferencesQuery = `
        SELECT 
          notifications_enabled, sms_notifications, email_notifications,
          language_preference, theme_preference, timezone_preference,
          privacy_level, data_sharing_consent, marketing_consent,
          created_at as preferences_created_at,
          updated_at as preferences_updated_at
        FROM user_preferences 
        WHERE user_id = $1
      `;

      const preferencesResult = await db.query(preferencesQuery, [userId]);

      // Get user statistics
      const statsQuery = `
        SELECT 
          COUNT(*) as total_logins,
          MAX(created_at) as last_login_at
        FROM audit_logs 
        WHERE user_id = $1 AND action = 'login' AND success = true
      `;

      const statsResult = await db.query(statsQuery, [userId]);

      const profile = {
        ...user,
        preferences: preferencesResult.rows[0] || null,
        statistics: {
          totalLogins: parseInt(statsResult.rows[0]?.total_logins || 0),
          lastLoginAt: statsResult.rows[0]?.last_login_at || null
        }
      };

      // Log profile retrieval
      await this.logUserActivity(null, userId, 'profile_viewed', {
        includePreferences: true,
        includeStatistics: true
      });

      return profile;

    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile information
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result
   */
  static async updateUserProfile(userId, updateData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const allowedFields = [
        'first_name', 'last_name', 'phone_number', 'preferred_language',
        'profile_image_url', 'date_of_birth', 'address'
      ];

      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      // Build dynamic update query
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = $${valueIndex}`);
          values.push(value);
          valueIndex++;
        }
      }

      if (updateFields.length === 0) {
        return {
          success: false,
          error: 'NO_UPDATES',
          message: 'No valid fields provided for update'
        };
      }

      // Add updated_at
      updateFields.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING 
          id, email, phone_number, first_name, last_name, nic_number,
          preferred_language, profile_image_url, date_of_birth, address,
          is_active, email_verified, phone_verified, updated_at
      `;

      const result = await client.query(query, values);

      if (result.rowCount === 0) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        };
      }

      // Log profile update
      await this.logUserActivity(client, userId, 'profile_updated', {
        updatedFields: Object.keys(updateData),
        timestamp: new Date()
      });

      await client.query('COMMIT');

      console.log(`✅ User profile updated: ${userId}`);
      return {
        success: true,
        user: result.rows[0],
        message: 'Profile updated successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error updating user profile:', error);
      return {
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to update profile'
      };
    } finally {
      client.release();
    }
  }

  /**
   * Verify user credentials (for login)
   * @param {string} identifier - Email, phone, or NIC
   * @param {string} password - Password to verify
   * @returns {Promise<Object>} Verification result with user data
   */
  static async verifyUserCredentials(identifier, password) {
    try {
      let user = null;
      let loginMethod = 'unknown';

      // Determine identifier type and find user
      if (identifier.includes('@')) {
        user = await this.findUserByEmail(identifier, true);
        loginMethod = 'email';
      } else if (identifier.startsWith('+')) {
        user = await this.findUserByPhone(identifier, true);
        loginMethod = 'phone';
      } else if (/^\d{9}[vVxX]?$|^\d{12}$/.test(identifier)) {
        user = await this.findUserByNIC(identifier, true);
        loginMethod = 'nic';
      } else {
        // Try all methods as fallback
        user = await this.findUserByEmail(identifier, true) ||
               await this.findUserByPhone(identifier, true) ||
               await this.findUserByNIC(identifier, true);
        loginMethod = 'multi';
      }

      if (!user) {
        return {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials'
        };
      }

      // Check if user is active
      if (!user.is_active) {
        await this.logUserActivity(null, user.id, 'login_failed', {
          reason: 'user_deactivated',
          identifier,
          loginMethod
        });

        return {
          success: false,
          error: 'USER_DEACTIVATED',
          message: 'Account has been deactivated'
        };
      }

      // Verify password using PasswordSecurity utility (same as registration)
      const isValidPassword = await PasswordSecurity.comparePassword(password, user.password_hash);
      
      if (!isValidPassword) {
        await this.logUserActivity(null, user.id, 'login_failed', {
          reason: 'invalid_password',
          identifier,
          loginMethod
        });

        return {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials'
        };
      }

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;

      // Log successful verification
      await this.logUserActivity(null, user.id, 'credentials_verified', {
        identifier,
        loginMethod,
        timestamp: new Date()
      });

      return {
        success: true,
        user: userWithoutPassword,
        loginMethod,
        message: 'Credentials verified successfully'
      };

    } catch (error) {
      console.error('❌ Error verifying credentials:', error);
      return {
        success: false,
        error: 'VERIFICATION_FAILED',
        message: 'Failed to verify credentials'
      };
    }
  }

  /**
   * Log user activity for audit trail
   * @param {Object} client - Database client (optional for transaction)
   * @param {string} userId - User ID
   * @param {string} action - Action performed
   * @param {Object} metadata - Additional metadata
   */
  static async logUserActivity(client, userId, action, metadata = {}) {
    try {
      const query = `
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, success, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `;

      const values = [
        userId,
        action,
        'user',
        userId,
        JSON.stringify(metadata),
        true
      ];

      if (client) {
        await client.query(query, values);
      } else {
        await db.query(query, values);
      }
    } catch (error) {
      console.error('❌ Error logging user activity:', error);
      // Don't throw error as this is for logging only
    }
  }

  /**
   * Get user activity statistics
   * @param {string} userId - User ID
   * @param {number} days - Number of days to look back (default: 30)
   * @returns {Promise<Object>} Activity statistics
   */
  static async getUserActivityStats(userId, days = 30) {
    try {
      const query = `
        SELECT 
          action,
          COUNT(*) as count,
          MAX(created_at) as last_occurrence
        FROM audit_logs 
        WHERE user_id = $1 
          AND created_at > NOW() - INTERVAL '${days} days'
        GROUP BY action
        ORDER BY count DESC
      `;

      const result = await db.query(query, [userId]);

      return {
        period: `${days} days`,
        activities: result.rows,
        totalActivities: result.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
      };

    } catch (error) {
      console.error('❌ Error getting user activity stats:', error);
      return {
        period: `${days} days`,
        activities: [],
        totalActivities: 0,
        error: 'Failed to retrieve activity statistics'
      };
    }
  }
}

module.exports = UserDB;
