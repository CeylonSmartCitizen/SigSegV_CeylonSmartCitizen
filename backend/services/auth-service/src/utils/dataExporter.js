// Data Export Utility for Ceylon Smart Citizen GDPR Compliance
const { query } = require('../config/database');

class DataExporter {
  /**
   * Export all user data for GDPR compliance
   */
  static async exportUserData(userId) {
    try {
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          userId: userId,
          exportVersion: '1.0',
          format: 'JSON'
        },
        personalInformation: {},
        appointments: [],
        sessions: [],
        preferences: {},
        securitySettings: {}
      };

      // Get user personal information
      const userQuery = `
        SELECT 
          email, phone_number, first_name, last_name, nic_number,
          preferred_language, date_of_birth, address, email_verified,
          phone_verified, created_at, updated_at
        FROM users 
        WHERE id = $1
      `;

      const userResult = await query(userQuery, [userId]);
      if (userResult.rows.length > 0) {
        exportData.personalInformation = {
          ...userResult.rows[0],
          // Remove sensitive fields or hash them
          nic_number: this.maskSensitiveData(userResult.rows[0].nic_number, 'nic'),
          phone_number: this.maskSensitiveData(userResult.rows[0].phone_number, 'phone')
        };
      }

      // Get user appointments (from appointment service database)
      try {
        const appointmentsQuery = `
          SELECT 
            a.appointment_date, a.appointment_time, a.status,
            a.citizen_notes, a.created_at,
            s.name as service_name,
            d.name as department_name
          FROM appointments a
          LEFT JOIN services s ON a.service_id = s.id
          LEFT JOIN departments d ON s.department_id = d.id
          WHERE a.user_id = $1
          ORDER BY a.created_at DESC
        `;

        const appointmentsResult = await query(appointmentsQuery, [userId]);
        exportData.appointments = appointmentsResult.rows;
      } catch (error) {
        console.log('Appointment data not available (different database)');
        exportData.appointments = [];
      }

      // Get user sessions
      const sessionsQuery = `
        SELECT 
          device_info, ip_address, created_at, expires_at, is_active
        FROM user_sessions 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `;

      try {
        const sessionsResult = await query(sessionsQuery, [userId]);
        exportData.sessions = sessionsResult.rows.map(session => ({
          ...session,
          ip_address: this.maskSensitiveData(session.ip_address, 'ip')
        }));
      } catch (error) {
        exportData.sessions = [];
      }

      // Get user preferences
      try {
        const UserPreferences = require('./userPreferences');
        const preferences = await UserPreferences.getUserPreferences(userId);
        exportData.preferences = preferences;
      } catch (error) {
        exportData.preferences = {};
      }

      // Get security settings
      try {
        const securityQuery = `
          SELECT 
            is_enabled as two_factor_enabled,
            created_at as two_factor_setup_date,
            verified_at as two_factor_verified_date
          FROM user_two_factor 
          WHERE user_id = $1
        `;

        const securityResult = await query(securityQuery, [userId]);
        if (securityResult.rows.length > 0) {
          exportData.securitySettings = securityResult.rows[0];
        }
      } catch (error) {
        exportData.securitySettings = {};
      }

      // Get rate limiting history (last 30 days)
      try {
        const rateLimitQuery = `
          SELECT 
            action_type, attempts_count, last_attempt_at, is_blocked
          FROM user_rate_limits 
          WHERE user_id = $1 AND last_attempt_at > NOW() - INTERVAL '30 days'
          ORDER BY last_attempt_at DESC
        `;

        const rateLimitResult = await query(rateLimitQuery, [userId]);
        exportData.securitySettings.rateLimitHistory = rateLimitResult.rows;
      } catch (error) {
        exportData.securitySettings.rateLimitHistory = [];
      }

      return {
        success: true,
        data: exportData,
        dataSize: JSON.stringify(exportData).length,
        recordCount: {
          appointments: exportData.appointments.length,
          sessions: exportData.sessions.length,
          totalRecords: exportData.appointments.length + exportData.sessions.length + 1
        }
      };

    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }

  /**
   * Mask sensitive data for privacy
   */
  static maskSensitiveData(data, type) {
    if (!data) return data;

    switch (type) {
      case 'nic':
        // Show first 2 and last 2 characters of NIC
        return data.length > 4 ? 
          data.substring(0, 2) + '*'.repeat(data.length - 4) + data.substring(data.length - 2) : 
          '*'.repeat(data.length);

      case 'phone':
        // Show first 3 and last 2 digits of phone
        return data.length > 5 ? 
          data.substring(0, 3) + '*'.repeat(data.length - 5) + data.substring(data.length - 2) : 
          '*'.repeat(data.length);

      case 'ip':
        // Mask last octet of IP address
        const ipParts = data.split('.');
        if (ipParts.length === 4) {
          return `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.***`;
        }
        return data;

      default:
        return data;
    }
  }

  /**
   * Generate data export summary
   */
  static async generateExportSummary(userId) {
    try {
      const summary = {
        userId: userId,
        exportRequestedAt: new Date().toISOString(),
        estimatedDataSize: 'Calculating...',
        availableData: {
          personalInformation: true,
          appointments: false,
          sessions: false,
          preferences: true,
          securitySettings: false
        }
      };

      // Check what data is available
      const userCheck = await query('SELECT id FROM users WHERE id = $1', [userId]);
      summary.availableData.personalInformation = userCheck.rows.length > 0;

      try {
        const sessionCheck = await query('SELECT COUNT(*) FROM user_sessions WHERE user_id = $1', [userId]);
        summary.availableData.sessions = parseInt(sessionCheck.rows[0].count) > 0;
      } catch (error) {
        summary.availableData.sessions = false;
      }

      try {
        const twoFactorCheck = await query('SELECT id FROM user_two_factor WHERE user_id = $1', [userId]);
        summary.availableData.securitySettings = twoFactorCheck.rows.length > 0;
      } catch (error) {
        summary.availableData.securitySettings = false;
      }

      return summary;
    } catch (error) {
      console.error('Error generating export summary:', error);
      throw error;
    }
  }

  /**
   * Log data export request for audit purposes
   */
  static async logExportRequest(userId, ipAddress, userAgent) {
    try {
      const logQuery = `
        INSERT INTO user_data_exports (
          user_id, requested_at, ip_address, user_agent, status
        ) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, 'completed')
      `;

      await query(logQuery, [userId, ipAddress, userAgent]);
    } catch (error) {
      console.error('Error logging export request:', error);
    }
  }
}

module.exports = DataExporter;
