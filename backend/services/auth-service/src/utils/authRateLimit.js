const db = require('../config/database');

/**
 * Advanced Rate Limiting for Authentication Attempts
 * Tracks failed login attempts by IP and email for enhanced security
 */
class AuthRateLimit {
  /**
   * Record a login attempt (successful or failed)
   * @param {string} ipAddress - Client IP address
   * @param {string} email - Email address attempted
   * @param {boolean} success - Whether the login was successful
   * @param {string} userAgent - Client user agent
   * @returns {Promise<void>}
   */
  static async recordAttempt(ipAddress, email, success, userAgent = null) {
    try {
      const query = `
        INSERT INTO failed_login_attempts (ip_address, email, success, user_agent)
        VALUES ($1, $2, $3, $4)
      `;
      
      await db.query(query, [ipAddress, email.toLowerCase(), success, userAgent]);
      
      if (!success) {
        console.log(`🚨 Failed login attempt from ${ipAddress} for ${email}`);
      }
    } catch (error) {
      console.error('❌ Error recording login attempt:', error);
    }
  }

  /**
   * Check if IP address is rate limited
   * @param {string} ipAddress - Client IP address
   * @returns {Promise<Object>} Rate limit status
   */
  static async checkIPRateLimit(ipAddress) {
    try {
      // Check failed attempts from this IP in the last hour
      const query = `
        SELECT COUNT(*) as attempt_count,
               MAX(attempt_time) as last_attempt
        FROM failed_login_attempts 
        WHERE ip_address = $1 
          AND success = false 
          AND attempt_time > NOW() - INTERVAL '1 hour'
      `;
      
      const result = await db.query(query, [ipAddress]);
      const { attempt_count, last_attempt } = result.rows[0];
      
      const maxAttempts = 10; // Max 10 failed attempts per hour per IP
      const isLimited = parseInt(attempt_count) >= maxAttempts;
      
      return {
        isLimited,
        attemptCount: parseInt(attempt_count),
        maxAttempts,
        lastAttempt: last_attempt,
        remainingAttempts: Math.max(0, maxAttempts - parseInt(attempt_count)),
        windowHours: 1
      };
    } catch (error) {
      console.error('❌ Error checking IP rate limit:', error);
      return {
        isLimited: false,
        attemptCount: 0,
        maxAttempts: 10,
        lastAttempt: null,
        remainingAttempts: 10,
        windowHours: 1
      };
    }
  }

  /**
   * Check if email address is rate limited
   * @param {string} email - Email address
   * @returns {Promise<Object>} Rate limit status
   */
  static async checkEmailRateLimit(email) {
    try {
      // Check failed attempts for this email in the last 30 minutes
      const query = `
        SELECT COUNT(*) as attempt_count,
               MAX(attempt_time) as last_attempt
        FROM failed_login_attempts 
        WHERE email = $1 
          AND success = false 
          AND attempt_time > NOW() - INTERVAL '30 minutes'
      `;
      
      const result = await db.query(query, [email.toLowerCase()]);
      const { attempt_count, last_attempt } = result.rows[0];
      
      const maxAttempts = 5; // Max 5 failed attempts per 30 minutes per email
      const isLimited = parseInt(attempt_count) >= maxAttempts;
      
      return {
        isLimited,
        attemptCount: parseInt(attempt_count),
        maxAttempts,
        lastAttempt: last_attempt,
        remainingAttempts: Math.max(0, maxAttempts - parseInt(attempt_count)),
        windowMinutes: 30
      };
    } catch (error) {
      console.error('❌ Error checking email rate limit:', error);
      return {
        isLimited: false,
        attemptCount: 0,
        maxAttempts: 5,
        lastAttempt: null,
        remainingAttempts: 5,
        windowMinutes: 30
      };
    }
  }

  /**
   * Comprehensive rate limit check (both IP and email)
   * @param {string} ipAddress - Client IP address
   * @param {string} email - Email address
   * @returns {Promise<Object>} Combined rate limit status
   */
  static async checkRateLimit(ipAddress, email) {
    try {
      const [ipLimit, emailLimit] = await Promise.all([
        this.checkIPRateLimit(ipAddress),
        this.checkEmailRateLimit(email)
      ]);

      const isLimited = ipLimit.isLimited || emailLimit.isLimited;
      
      return {
        isLimited,
        ipLimit,
        emailLimit,
        reason: ipLimit.isLimited ? 'ip_limit' : emailLimit.isLimited ? 'email_limit' : null,
        waitTime: this.calculateWaitTime(ipLimit, emailLimit)
      };
    } catch (error) {
      console.error('❌ Error in comprehensive rate limit check:', error);
      return {
        isLimited: false,
        ipLimit: { isLimited: false },
        emailLimit: { isLimited: false },
        reason: null,
        waitTime: 0
      };
    }
  }

  /**
   * Calculate wait time before next attempt is allowed
   * @param {Object} ipLimit - IP limit status
   * @param {Object} emailLimit - Email limit status
   * @returns {number} Wait time in minutes
   */
  static calculateWaitTime(ipLimit, emailLimit) {
    if (ipLimit.isLimited && emailLimit.isLimited) {
      return Math.max(60, 30); // Longest window
    } else if (ipLimit.isLimited) {
      return 60; // 1 hour for IP limit
    } else if (emailLimit.isLimited) {
      return 30; // 30 minutes for email limit
    }
    return 0;
  }

  /**
   * Get rate limit statistics
   * @returns {Promise<Object>} Rate limit statistics
   */
  static async getStats() {
    try {
      const queries = {
        totalAttempts24h: `
          SELECT COUNT(*) as count 
          FROM failed_login_attempts 
          WHERE attempt_time > NOW() - INTERVAL '24 hours'
        `,
        failedAttempts24h: `
          SELECT COUNT(*) as count 
          FROM failed_login_attempts 
          WHERE attempt_time > NOW() - INTERVAL '24 hours' AND success = false
        `,
        successfulAttempts24h: `
          SELECT COUNT(*) as count 
          FROM failed_login_attempts 
          WHERE attempt_time > NOW() - INTERVAL '24 hours' AND success = true
        `,
        topFailedIPs: `
          SELECT ip_address, COUNT(*) as attempts
          FROM failed_login_attempts 
          WHERE attempt_time > NOW() - INTERVAL '24 hours' AND success = false
          GROUP BY ip_address 
          ORDER BY attempts DESC 
          LIMIT 10
        `,
        topFailedEmails: `
          SELECT email, COUNT(*) as attempts
          FROM failed_login_attempts 
          WHERE attempt_time > NOW() - INTERVAL '24 hours' AND success = false
          GROUP BY email 
          ORDER BY attempts DESC 
          LIMIT 10
        `
      };

      const [total, failed, successful, topIPs, topEmails] = await Promise.all([
        db.query(queries.totalAttempts24h),
        db.query(queries.failedAttempts24h),
        db.query(queries.successfulAttempts24h),
        db.query(queries.topFailedIPs),
        db.query(queries.topFailedEmails)
      ]);

      return {
        last24Hours: {
          totalAttempts: parseInt(total.rows[0].count),
          failedAttempts: parseInt(failed.rows[0].count),
          successfulAttempts: parseInt(successful.rows[0].count),
          successRate: total.rows[0].count > 0 
            ? ((successful.rows[0].count / total.rows[0].count) * 100).toFixed(2) + '%'
            : '0%'
        },
        topFailedIPs: topIPs.rows.map(row => ({
          ip: row.ip_address,
          attempts: parseInt(row.attempts)
        })),
        topFailedEmails: topEmails.rows.map(row => ({
          email: row.email,
          attempts: parseInt(row.attempts)
        })),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('❌ Error getting rate limit stats:', error);
      return {
        error: 'Failed to retrieve stats',
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Clean up old login attempt records
   * @returns {Promise<number>} Number of records deleted
   */
  static async cleanupOldRecords() {
    try {
      // Keep records for 7 days for analysis
      const query = `
        DELETE FROM failed_login_attempts 
        WHERE attempt_time < NOW() - INTERVAL '7 days'
      `;
      
      const result = await db.query(query);
      const deletedCount = result.rowCount;
      
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} old login attempt records`);
      }
      
      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up old records:', error);
      return 0;
    }
  }

  /**
   * Express middleware for rate limiting login attempts
   * @returns {Function} Express middleware function
   */
  static middleware() {
    return async (req, res, next) => {
      try {
        const ipAddress = req.ip;
        const email = req.body?.email;

        if (!email) {
          return next(); // Skip rate limiting if no email provided
        }

        const rateLimit = await this.checkRateLimit(ipAddress, email);

        if (rateLimit.isLimited) {
          // Record this blocked attempt
          await this.recordAttempt(ipAddress, email, false, req.get('User-Agent'));

          return res.status(429).json({
            success: false,
            message: 'Too many failed login attempts. Please try again later.',
            code: 'RATE_LIMITED',
            details: {
              reason: rateLimit.reason,
              waitTimeMinutes: rateLimit.waitTime,
              ipAttempts: rateLimit.ipLimit.attemptCount,
              emailAttempts: rateLimit.emailLimit.attemptCount
            }
          });
        }

        // Add rate limit info to request for controller use
        req.rateLimit = rateLimit;
        next();
      } catch (error) {
        console.error('❌ Error in rate limit middleware:', error);
        // Don't block request on middleware error
        next();
      }
    };
  }
}

module.exports = AuthRateLimit;
