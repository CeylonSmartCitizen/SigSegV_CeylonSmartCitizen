// Session Management Utility for Ceylon Smart Citizen Auth Service
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

class SessionManager {
  /**
   * Store active session information in database
   */
  static async createSession(userId, tokenData, userAgent, ipAddress) {
    try {
      const insertQuery = `
        INSERT INTO user_sessions (
          id, user_id, token_jti, device_info, ip_address, 
          expires_at, created_at, is_active
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (token_jti) DO UPDATE SET
          ip_address = EXCLUDED.ip_address,
          device_info = EXCLUDED.device_info,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const sessionId = tokenData.jti;
      const expiresAt = new Date(tokenData.exp * 1000);
      
      const result = await query(insertQuery, [
        sessionId,
        userId,
        tokenData.jti,
        userAgent || 'Unknown Device',
        ipAddress,
        expiresAt,
        new Date(),
        true
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get all active sessions for a user
   */
  static async getActiveSessions(userId) {
    try {
      const selectQuery = `
        SELECT 
          id,
          token_jti,
          device_info,
          ip_address,
          created_at,
          expires_at,
          updated_at,
          CASE 
            WHEN expires_at > CURRENT_TIMESTAMP THEN true 
            ELSE false 
          END as is_valid
        FROM user_sessions 
        WHERE user_id = $1 
          AND is_active = true 
          AND expires_at > CURRENT_TIMESTAMP
        ORDER BY updated_at DESC
      `;

      const result = await query(selectQuery, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw error;
    }
  }

  /**
   * Logout specific session
   */
  static async logoutSession(sessionId, userId) {
    try {
      const updateQuery = `
        UPDATE user_sessions 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;

      const result = await query(updateQuery, [sessionId, userId]);
      
      if (result.rows.length > 0) {
        // Add token to blacklist
        const TokenBlacklist = require('./tokenBlacklist');
        await TokenBlacklist.addToken(result.rows[0].token_jti);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error logging out session:', error);
      throw error;
    }
  }

  /**
   * Logout all sessions for a user
   */
  static async logoutAllSessions(userId) {
    try {
      // Get all active sessions first to blacklist tokens
      const activeSessions = await this.getActiveSessions(userId);
      
      // Blacklist all active tokens
      const TokenBlacklist = require('./tokenBlacklist');
      for (const session of activeSessions) {
        await TokenBlacklist.addToken(session.token_jti);
      }

      // Deactivate all sessions
      const updateQuery = `
        UPDATE user_sessions 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND is_active = true
        RETURNING COUNT(*) as logged_out_count
      `;

      const result = await query(updateQuery, [userId]);
      
      // Update global logout time
      await query(
        'UPDATE users SET global_logout_time = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );

      return {
        loggedOutSessions: activeSessions.length,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error logging out all sessions:', error);
      throw error;
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions() {
    try {
      const deleteQuery = `
        DELETE FROM user_sessions 
        WHERE expires_at <= CURRENT_TIMESTAMP OR is_active = false
        RETURNING COUNT(*) as deleted_count
      `;

      const result = await query(deleteQuery);
      return result.rows[0].deleted_count;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }

  /**
   * Validate session exists and is active
   */
  static async validateSession(sessionJti, userId) {
    try {
      const selectQuery = `
        SELECT * FROM user_sessions 
        WHERE token_jti = $1 
          AND user_id = $2 
          AND is_active = true 
          AND expires_at > CURRENT_TIMESTAMP
      `;

      const result = await query(selectQuery, [sessionJti, userId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  /**
   * Update session activity
   */
  static async updateSessionActivity(sessionJti) {
    try {
      const updateQuery = `
        UPDATE user_sessions 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE token_jti = $1 AND is_active = true
      `;

      await query(updateQuery, [sessionJti]);
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }
}

module.exports = SessionManager;
