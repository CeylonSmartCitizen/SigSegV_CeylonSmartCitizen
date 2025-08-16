// Two-Factor Authentication Utility for Ceylon Smart Citizen
const crypto = require('crypto');
const { query } = require('../config/database');

class TwoFactorAuth {
  /**
   * Generate a 6-digit OTP code
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate backup codes for 2FA recovery
   */
  static generateBackupCodes(count = 8) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Setup 2FA for a user
   */
  static async setupTwoFactor(userId) {
    try {
      // Generate secret key and backup codes
      const secret = crypto.randomBytes(32).toString('hex');
      const backupCodes = this.generateBackupCodes();
      
      // Store 2FA settings (initially not enabled until verified)
      const insertQuery = `
        INSERT INTO user_two_factor (
          user_id, secret_key, backup_codes, is_enabled, created_at
        ) VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          secret_key = EXCLUDED.secret_key,
          backup_codes = EXCLUDED.backup_codes,
          is_enabled = false,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `;

      await query(insertQuery, [userId, secret, JSON.stringify(backupCodes)]);

      return {
        secret,
        backupCodes,
        qrCodeData: `ceylon-smart-citizen:${userId}?secret=${secret}`,
        message: 'Two-factor authentication setup initiated. Please verify with your authenticator app.'
      };
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error;
    }
  }

  /**
   * Verify 2FA code and enable 2FA
   */
  static async verifyTwoFactor(userId, code) {
    try {
      // Get user's 2FA settings
      const selectQuery = `
        SELECT secret_key, backup_codes, is_enabled 
        FROM user_two_factor 
        WHERE user_id = $1
      `;

      const result = await query(selectQuery, [userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Two-factor authentication not set up');
      }

      const { secret_key, backup_codes, is_enabled } = result.rows[0];

      // For demonstration, we'll use a simple time-based verification
      // In production, you'd use a proper TOTP library like 'speakeasy'
      const isValidCode = this.verifyTOTP(secret_key, code);
      const isBackupCode = this.verifyBackupCode(backup_codes, code);

      if (!isValidCode && !isBackupCode) {
        throw new Error('Invalid verification code');
      }

      // Enable 2FA if verification successful
      const updateQuery = `
        UPDATE user_two_factor 
        SET is_enabled = true, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `;

      await query(updateQuery, [userId]);

      // If backup code was used, remove it from the list
      if (isBackupCode) {
        await this.removeUsedBackupCode(userId, code);
      }

      return {
        success: true,
        message: 'Two-factor authentication enabled successfully',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      throw error;
    }
  }

  /**
   * Disable 2FA for a user
   */
  static async disableTwoFactor(userId, password) {
    try {
      // Verify user password before disabling 2FA
      const userQuery = 'SELECT password_hash FROM users WHERE id = $1';
      const userResult = await query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);
      
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      // Disable 2FA
      const updateQuery = `
        UPDATE user_two_factor 
        SET is_enabled = false, disabled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `;

      await query(updateQuery, [userId]);

      return {
        success: true,
        message: 'Two-factor authentication disabled successfully',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  static async is2FAEnabled(userId) {
    try {
      const selectQuery = `
        SELECT is_enabled 
        FROM user_two_factor 
        WHERE user_id = $1
      `;

      const result = await query(selectQuery, [userId]);
      return result.rows.length > 0 && result.rows[0].is_enabled;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  }

  /**
   * Verify TOTP code (simplified implementation)
   * In production, use a proper TOTP library
   */
  static verifyTOTP(secret, code) {
    // This is a simplified implementation
    // In production, use libraries like 'speakeasy' or 'otplib'
    const timeStep = Math.floor(Date.now() / 30000); // 30-second time step
    const hash = crypto.createHmac('sha1', secret).update(timeStep.toString()).digest('hex');
    const offset = parseInt(hash.substr(-1), 16);
    const binaryCode = parseInt(hash.substr(offset * 2, 8), 16);
    const otp = (binaryCode & 0x7fffffff) % 1000000;
    
    return otp.toString().padStart(6, '0') === code;
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(backupCodes, code) {
    try {
      const codes = JSON.parse(backupCodes);
      return codes.includes(code.toUpperCase());
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove used backup code
   */
  static async removeUsedBackupCode(userId, usedCode) {
    try {
      const selectQuery = 'SELECT backup_codes FROM user_two_factor WHERE user_id = $1';
      const result = await query(selectQuery, [userId]);
      
      if (result.rows.length > 0) {
        const codes = JSON.parse(result.rows[0].backup_codes);
        const updatedCodes = codes.filter(code => code !== usedCode.toUpperCase());
        
        const updateQuery = `
          UPDATE user_two_factor 
          SET backup_codes = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = $2
        `;
        
        await query(updateQuery, [JSON.stringify(updatedCodes), userId]);
      }
    } catch (error) {
      console.error('Error removing used backup code:', error);
    }
  }

  /**
   * Generate new backup codes
   */
  static async regenerateBackupCodes(userId) {
    try {
      const newBackupCodes = this.generateBackupCodes();
      
      const updateQuery = `
        UPDATE user_two_factor 
        SET backup_codes = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $2 AND is_enabled = true
        RETURNING id
      `;

      const result = await query(updateQuery, [JSON.stringify(newBackupCodes), userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Two-factor authentication not enabled');
      }

      return {
        backupCodes: newBackupCodes,
        message: 'New backup codes generated successfully'
      };
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      throw error;
    }
  }
}

module.exports = TwoFactorAuth;
