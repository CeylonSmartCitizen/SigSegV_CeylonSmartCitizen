const db = require('../config/database');

/**
 * JWT Token Blacklist Management
 * Handles token invalidation for logout and security purposes
 */
class TokenBlacklist {
  /**
   * Add a token to the blacklist
   * @param {string} token - JWT token to blacklist
   * @param {number} userId - User ID who owns the token
   * @param {Date} expiresAt - When the token naturally expires
   * @param {string} reason - Reason for blacklisting (logout, security, etc.)
   * @returns {Promise<boolean>} Success status
   */
  static async addToken(token, userId, expiresAt, reason = 'logout') {
    try {
      const query = `
        INSERT INTO blacklisted_tokens (token_hash, user_id, blacklisted_at, expires_at, reason)
        VALUES ($1, $2, NOW(), $3, $4)
        ON CONFLICT (token_hash) DO NOTHING
      `;
      
      // Hash the token for security (don't store full JWT)
      const crypto = require('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      await db.query(query, [tokenHash, userId, expiresAt, reason]);
      
      console.log(`✅ Token blacklisted for user ${userId}, reason: ${reason}`);
      return true;
    } catch (error) {
      console.error('❌ Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Check if a token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {Promise<boolean>} True if token is blacklisted
   */
  static async isTokenBlacklisted(token) {
    try {
      const crypto = require('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const query = `
        SELECT id FROM blacklisted_tokens 
        WHERE token_hash = $1 AND expires_at > NOW()
      `;
      
      const result = await db.query(query, [tokenHash]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('❌ Error checking token blacklist:', error);
      // In case of error, allow the token (fail open for availability)
      return false;
    }
  }

  /**
   * Blacklist all tokens for a specific user
   * @param {number} userId - User ID
   * @param {string} reason - Reason for mass blacklisting
   * @returns {Promise<number>} Number of tokens blacklisted
   */
  static async blacklistAllUserTokens(userId, reason = 'security_logout') {
    try {
      // We can't blacklist all tokens without knowing them, but we can record the action
      // and use a user_global_logout_time approach instead
      
      const query = `
        UPDATE users 
        SET global_logout_time = NOW(), updated_at = NOW()
        WHERE id = $1
      `;
      
      await db.query(query, [userId]);
      
      // Log the global logout event
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, success)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          'global_logout',
          'user',
          userId,
          JSON.stringify({ reason, timestamp: new Date() }),
          true
        ]
      );
      
      console.log(`✅ Global logout initiated for user ${userId}, reason: ${reason}`);
      return true;
    } catch (error) {
      console.error('❌ Error in global logout:', error);
      return false;
    }
  }

  /**
   * Clean up expired blacklisted tokens (maintenance task)
   * @returns {Promise<number>} Number of tokens cleaned
   */
  static async cleanupExpiredTokens() {
    try {
      const query = `
        DELETE FROM blacklisted_tokens 
        WHERE expires_at <= NOW()
      `;
      
      const result = await db.query(query);
      const deletedCount = result.rowCount;
      
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired blacklisted tokens`);
      }
      
      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up blacklisted tokens:', error);
      return 0;
    }
  }

  /**
   * Get blacklist statistics
   * @returns {Promise<Object>} Blacklist statistics
   */
  static async getStats() {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM blacklisted_tokens WHERE expires_at > NOW()',
        byReason: `
          SELECT reason, COUNT(*) as count 
          FROM blacklisted_tokens 
          WHERE expires_at > NOW() 
          GROUP BY reason
        `,
        recentLogouts: `
          SELECT COUNT(*) as count 
          FROM blacklisted_tokens 
          WHERE reason = 'logout' AND blacklisted_at > NOW() - INTERVAL '24 hours'
        `
      };

      const [totalResult, reasonResult, recentResult] = await Promise.all([
        db.query(queries.total),
        db.query(queries.byReason),
        db.query(queries.recentLogouts)
      ]);

      return {
        totalBlacklistedTokens: parseInt(totalResult.rows[0].count),
        tokensByReason: reasonResult.rows.reduce((acc, row) => {
          acc[row.reason] = parseInt(row.count);
          return acc;
        }, {}),
        recentLogouts24h: parseInt(recentResult.rows[0].count),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('❌ Error getting blacklist stats:', error);
      return {
        error: 'Failed to retrieve stats',
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Check if user has been globally logged out after token creation
   * @param {number} userId - User ID
   * @param {Date} tokenIssuedAt - When the token was issued
   * @returns {Promise<boolean>} True if user was globally logged out after token creation
   */
  static async isUserGloballyLoggedOut(userId, tokenIssuedAt) {
    try {
      const query = `
        SELECT global_logout_time 
        FROM users 
        WHERE id = $1 AND global_logout_time IS NOT NULL
      `;
      
      const result = await db.query(query, [userId]);
      
      if (result.rows.length === 0 || !result.rows[0].global_logout_time) {
        return false;
      }
      
      const globalLogoutTime = new Date(result.rows[0].global_logout_time);
      const tokenTime = new Date(tokenIssuedAt * 1000); // Convert Unix timestamp to Date
      
      return globalLogoutTime > tokenTime;
    } catch (error) {
      console.error('❌ Error checking global logout:', error);
      return false;
    }
  }
}

module.exports = TokenBlacklist;
