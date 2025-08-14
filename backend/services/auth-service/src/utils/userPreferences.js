const db = require('../config/database');

/**
 * User Preferences Management
 * Handles user-specific settings and preferences
 */
class UserPreferences {
  /**
   * Get user preferences
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User preferences or null
   */
  static async getUserPreferences(userId) {
    try {
      const query = `
        SELECT 
          notifications_enabled, sms_notifications, email_notifications,
          language_preference, theme_preference, timezone_preference,
          privacy_level, data_sharing_consent, marketing_consent,
          created_at, updated_at
        FROM user_preferences 
        WHERE user_id = $1
      `;

      const result = await db.query(query, [userId]);

      if (result.rows.length === 0) {
        // Return default preferences if none exist
        return this.getDefaultPreferences();
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Create or update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Preferences to set
   * @returns {Promise<Object>} Operation result
   */
  static async setUserPreferences(userId, preferences) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      const allowedFields = [
        'notifications_enabled', 'sms_notifications', 'email_notifications',
        'language_preference', 'theme_preference', 'timezone_preference',
        'privacy_level', 'data_sharing_consent', 'marketing_consent'
      ];

      // Filter only allowed fields
      const filteredPreferences = {};
      for (const [key, value] of Object.entries(preferences)) {
        if (allowedFields.includes(key) && value !== undefined) {
          filteredPreferences[key] = value;
        }
      }

      if (Object.keys(filteredPreferences).length === 0) {
        return {
          success: false,
          error: 'NO_VALID_PREFERENCES',
          message: 'No valid preferences provided'
        };
      }

      // Check if preferences already exist
      const existsQuery = 'SELECT id FROM user_preferences WHERE user_id = $1';
      const existsResult = await client.query(existsQuery, [userId]);

      let query, values;

      if (existsResult.rows.length > 0) {
        // Update existing preferences
        const updateFields = [];
        const updateValues = [];
        let valueIndex = 1;

        for (const [key, value] of Object.entries(filteredPreferences)) {
          updateFields.push(`${key} = $${valueIndex}`);
          updateValues.push(value);
          valueIndex++;
        }

        updateFields.push(`updated_at = NOW()`);
        updateValues.push(userId);

        query = `
          UPDATE user_preferences 
          SET ${updateFields.join(', ')}
          WHERE user_id = $${valueIndex}
          RETURNING *
        `;
        values = updateValues;

      } else {
        // Insert new preferences with defaults
        const defaultPrefs = this.getDefaultPreferences();
        const mergedPrefs = { ...defaultPrefs, ...filteredPreferences };

        const fields = Object.keys(mergedPrefs);
        const placeholders = fields.map((_, index) => `$${index + 2}`);

        query = `
          INSERT INTO user_preferences (user_id, ${fields.join(', ')}, created_at, updated_at)
          VALUES ($1, ${placeholders.join(', ')}, NOW(), NOW())
          RETURNING *
        `;

        values = [userId, ...Object.values(mergedPrefs)];
      }

      const result = await client.query(query, values);

      // Log preferences update
      await this.logPreferencesActivity(client, userId, 'preferences_updated', {
        updatedFields: Object.keys(filteredPreferences),
        preferences: filteredPreferences
      });

      await client.query('COMMIT');

      console.log(`✅ User preferences updated: ${userId}`);
      return {
        success: true,
        preferences: result.rows[0],
        message: 'Preferences updated successfully'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error setting user preferences:', error);
      return {
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to update preferences'
      };
    } finally {
      client.release();
    }
  }

  /**
   * Initialize default preferences for a new user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Operation result
   */
  static async initializeDefaultPreferences(userId) {
    try {
      const defaultPrefs = this.getDefaultPreferences();
      return await this.setUserPreferences(userId, defaultPrefs);
    } catch (error) {
      console.error('❌ Error initializing default preferences:', error);
      return {
        success: false,
        error: 'INITIALIZATION_FAILED',
        message: 'Failed to initialize default preferences'
      };
    }
  }

  /**
   * Delete user preferences (GDPR compliance)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Operation result
   */
  static async deleteUserPreferences(userId) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      const query = 'DELETE FROM user_preferences WHERE user_id = $1';
      const result = await client.query(query, [userId]);

      // Log preferences deletion
      await this.logPreferencesActivity(client, userId, 'preferences_deleted', {
        reason: 'user_request_or_account_deletion'
      });

      await client.query('COMMIT');

      console.log(`✅ User preferences deleted: ${userId}`);
      return {
        success: true,
        message: 'Preferences deleted successfully',
        deletedCount: result.rowCount
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error deleting user preferences:', error);
      return {
        success: false,
        error: 'DELETION_FAILED',
        message: 'Failed to delete preferences'
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get default preferences
   * @returns {Object} Default preferences object
   */
  static getDefaultPreferences() {
    return {
      notifications_enabled: true,
      sms_notifications: true,
      email_notifications: true,
      language_preference: 'en',
      theme_preference: 'light',
      timezone_preference: 'Asia/Colombo',
      privacy_level: 'standard',
      data_sharing_consent: false,
      marketing_consent: false
    };
  }

  /**
   * Update specific preference
   * @param {string} userId - User ID
   * @param {string} preference - Preference key
   * @param {any} value - Preference value
   * @returns {Promise<Object>} Operation result
   */
  static async updatePreference(userId, preference, value) {
    const allowedFields = [
      'notifications_enabled', 'sms_notifications', 'email_notifications',
      'language_preference', 'theme_preference', 'timezone_preference',
      'privacy_level', 'data_sharing_consent', 'marketing_consent'
    ];

    if (!allowedFields.includes(preference)) {
      return {
        success: false,
        error: 'INVALID_PREFERENCE',
        message: `Invalid preference key: ${preference}`
      };
    }

    return await this.setUserPreferences(userId, { [preference]: value });
  }

  /**
   * Get preferences summary for multiple users (admin function)
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise<Object>} Preferences summary
   */
  static async getPreferencesSummary(userIds = []) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN notifications_enabled = true THEN 1 END) as notifications_enabled_count,
          COUNT(CASE WHEN sms_notifications = true THEN 1 END) as sms_enabled_count,
          COUNT(CASE WHEN email_notifications = true THEN 1 END) as email_enabled_count,
          COUNT(CASE WHEN language_preference = 'en' THEN 1 END) as english_users,
          COUNT(CASE WHEN language_preference = 'si' THEN 1 END) as sinhala_users,
          COUNT(CASE WHEN language_preference = 'ta' THEN 1 END) as tamil_users,
          COUNT(CASE WHEN theme_preference = 'light' THEN 1 END) as light_theme_users,
          COUNT(CASE WHEN theme_preference = 'dark' THEN 1 END) as dark_theme_users,
          COUNT(CASE WHEN data_sharing_consent = true THEN 1 END) as data_sharing_consent_count,
          COUNT(CASE WHEN marketing_consent = true THEN 1 END) as marketing_consent_count
        FROM user_preferences
      `;

      const values = [];

      if (userIds.length > 0) {
        query += ' WHERE user_id = ANY($1)';
        values.push(userIds);
      }

      const result = await db.query(query, values);

      return {
        success: true,
        summary: result.rows[0],
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('❌ Error getting preferences summary:', error);
      return {
        success: false,
        error: 'SUMMARY_FAILED',
        message: 'Failed to generate preferences summary'
      };
    }
  }

  /**
   * Apply privacy level settings
   * @param {string} userId - User ID
   * @param {string} privacyLevel - Privacy level ('minimal', 'standard', 'full')
   * @returns {Promise<Object>} Operation result
   */
  static async applyPrivacyLevel(userId, privacyLevel) {
    const privacySettings = {
      minimal: {
        notifications_enabled: false,
        sms_notifications: false,
        email_notifications: false,
        data_sharing_consent: false,
        marketing_consent: false,
        privacy_level: 'minimal'
      },
      standard: {
        notifications_enabled: true,
        sms_notifications: true,
        email_notifications: true,
        data_sharing_consent: false,
        marketing_consent: false,
        privacy_level: 'standard'
      },
      full: {
        notifications_enabled: true,
        sms_notifications: true,
        email_notifications: true,
        data_sharing_consent: true,
        marketing_consent: true,
        privacy_level: 'full'
      }
    };

    if (!privacySettings[privacyLevel]) {
      return {
        success: false,
        error: 'INVALID_PRIVACY_LEVEL',
        message: 'Invalid privacy level. Must be minimal, standard, or full.'
      };
    }

    return await this.setUserPreferences(userId, privacySettings[privacyLevel]);
  }

  /**
   * Log preferences activity for audit trail
   * @param {Object} client - Database client
   * @param {string} userId - User ID
   * @param {string} action - Action performed
   * @param {Object} metadata - Additional metadata
   */
  static async logPreferencesActivity(client, userId, action, metadata = {}) {
    try {
      const query = `
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, success, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `;

      const values = [
        userId,
        action,
        'user_preferences',
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
      console.error('❌ Error logging preferences activity:', error);
      // Don't throw error as this is for logging only
    }
  }
}

module.exports = UserPreferences;
