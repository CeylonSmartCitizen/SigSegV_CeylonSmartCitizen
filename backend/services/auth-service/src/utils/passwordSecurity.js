const bcrypt = require('bcryptjs');
const validator = require('validator');
const xss = require('xss');

/**
 * Password Security Utility
 * Implements secure password hashing, validation, and comparison
 */
class PasswordSecurity {
  // Security configuration
  static SALT_ROUNDS = 12; // High security salt rounds
  static MIN_PASSWORD_LENGTH = 8;
  static MAX_PASSWORD_LENGTH = 128;

  /**
   * Hash password with bcrypt using secure salt rounds
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    try {
      if (!password || typeof password !== 'string') {
        throw new Error('Password must be a non-empty string');
      }

      // Generate salt and hash password with 12+ rounds for security
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      console.log(`✅ Password hashed with ${this.SALT_ROUNDS} salt rounds`);
      return hashedPassword;
    } catch (error) {
      console.error('❌ Password hashing error:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare password with hashed password for login
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if passwords match
   */
  static async comparePassword(plainPassword, hashedPassword) {
    try {
      if (!plainPassword || !hashedPassword) {
        return false;
      }

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      
      if (isMatch) {
        console.log('✅ Password verification successful');
      } else {
        console.log('❌ Password verification failed');
      }
      
      return isMatch;
    } catch (error) {
      console.error('❌ Password comparison error:', error);
      return false;
    }
  }

  /**
   * Validate password strength with comprehensive rules
   * @param {string} password - Password to validate
   * @param {string} language - Language for error messages ('en', 'si', 'ta')
   * @returns {Object} Validation result with strength score
   */
  static validatePasswordStrength(password, language = 'en') {
    const result = {
      isValid: false,
      score: 0,
      strength: 'weak',
      errors: [],
      requirements: {
        length: false,
        lowercase: false,
        uppercase: false,
        numbers: false,
        specialChars: false,
        noCommonPasswords: false
      }
    };

    const messages = this.getPasswordMessages(language);

    if (!password || typeof password !== 'string') {
      result.errors.push(messages.required);
      return result;
    }

    // Length validation (8+ characters)
    if (password.length >= this.MIN_PASSWORD_LENGTH && password.length <= this.MAX_PASSWORD_LENGTH) {
      result.requirements.length = true;
      result.score += 1;
    } else if (password.length < this.MIN_PASSWORD_LENGTH) {
      result.errors.push(messages.tooShort.replace('{min}', this.MIN_PASSWORD_LENGTH));
    } else {
      result.errors.push(messages.tooLong.replace('{max}', this.MAX_PASSWORD_LENGTH));
    }

    // Lowercase letter validation
    if (/[a-z]/.test(password)) {
      result.requirements.lowercase = true;
      result.score += 1;
    } else {
      result.errors.push(messages.noLowercase);
    }

    // Uppercase letter validation
    if (/[A-Z]/.test(password)) {
      result.requirements.uppercase = true;
      result.score += 1;
    } else {
      result.errors.push(messages.noUppercase);
    }

    // Number validation
    if (/\d/.test(password)) {
      result.requirements.numbers = true;
      result.score += 1;
    } else {
      result.errors.push(messages.noNumbers);
    }

    // Special character validation
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      result.requirements.specialChars = true;
      result.score += 1;
    } else {
      result.errors.push(messages.noSpecialChars);
    }

    // Common password check
    if (!this.isCommonPassword(password)) {
      result.requirements.noCommonPasswords = true;
      result.score += 1;
    } else {
      result.errors.push(messages.commonPassword);
    }

    // Additional security checks
    if (password.length >= 12) {
      result.score += 1; // Bonus for longer passwords
    }

    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
      result.score += 1; // Bonus for complex combination
    }

    // Determine password strength
    if (result.score >= 6) {
      result.strength = 'very-strong';
    } else if (result.score >= 5) {
      result.strength = 'strong';
    } else if (result.score >= 3) {
      result.strength = 'medium';
    } else if (result.score >= 1) {
      result.strength = 'weak';
    } else {
      result.strength = 'very-weak';
    }

    // Password is valid if it meets minimum requirements
    result.isValid = result.score >= 4 && result.requirements.length && 
                     result.requirements.lowercase && result.requirements.uppercase && 
                     result.requirements.numbers;

    return result;
  }

  /**
   * Check if password is in common passwords list
   * @param {string} password - Password to check
   * @returns {boolean} True if password is common
   */
  static isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
      'qwerty123', 'admin123', 'root', 'user', 'guest', 'test', 'demo',
      'ceylon', 'srilanka', 'colombo', 'kandy', 'galle', 'jaffna'
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Verify old password during password change
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} hashedPassword - Stored hashed password
   * @returns {Promise<boolean>} True if old password is correct
   */
  static async verifyOldPassword(userId, oldPassword, hashedPassword) {
    try {
      const isValid = await this.comparePassword(oldPassword, hashedPassword);
      
      if (!isValid) {
        console.log(`❌ Old password verification failed for user: ${userId}`);
      } else {
        console.log(`✅ Old password verified for user: ${userId}`);
      }
      
      return isValid;
    } catch (error) {
      console.error('❌ Old password verification error:', error);
      return false;
    }
  }

  /**
   * Generate secure password suggestions
   * @param {number} length - Desired password length (default: 12)
   * @returns {string} Generated secure password
   */
  static generateSecurePassword(length = 12) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill remaining length with random characters
    const allChars = lowercase + uppercase + numbers + specialChars;
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle password characters
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Check for password reuse (compare with previous passwords)
   * @param {string} newPassword - New password to check
   * @param {Array} previousPasswords - Array of previous hashed passwords
   * @returns {Promise<boolean>} True if password was previously used
   */
  static async checkPasswordReuse(newPassword, previousPasswords = []) {
    try {
      for (const oldHash of previousPasswords) {
        if (await this.comparePassword(newPassword, oldHash)) {
          return true; // Password was previously used
        }
      }
      return false; // Password is new
    } catch (error) {
      console.error('❌ Password reuse check error:', error);
      return false;
    }
  }

  /**
   * Get password validation messages in different languages
   * @param {string} language - Language code ('en', 'si', 'ta')
   * @returns {Object} Localized messages
   */
  static getPasswordMessages(language) {
    const messages = {
      en: {
        required: 'Password is required',
        tooShort: 'Password must be at least {min} characters long',
        tooLong: 'Password must not exceed {max} characters',
        noLowercase: 'Password must contain at least one lowercase letter',
        noUppercase: 'Password must contain at least one uppercase letter',
        noNumbers: 'Password must contain at least one number',
        noSpecialChars: 'Password must contain at least one special character (!@#$%^&*)',
        commonPassword: 'Password is too common, please choose a more unique password',
        passwordReused: 'Password was previously used, please choose a different password'
      },
      si: {
        required: 'මුරපදය අවශ්‍යයි',
        tooShort: 'මුරපදය අවම වශයෙන් අක්ෂර {min}ක් තිබිය යුතුය',
        tooLong: 'මුරපදය අක්ෂර {max}ට වඩා නොවිය යුතුය',
        noLowercase: 'මුරපදයේ අවම වශයෙන් එක් කුඩා අකුරක් තිබිය යුතුය',
        noUppercase: 'මුරපදයේ අවම වශයෙන් එක් ලොකු අකුරක් තිබිය යුතුය',
        noNumbers: 'මුරපදයේ අවම වශයෙන් එක් සංඛ්‍යාවක් තිබිය යුතුය',
        noSpecialChars: 'මුරපදයේ අවම වශයෙන් එක් විශේෂ අකුරක් තිබිය යුතුය (!@#$%^&*)',
        commonPassword: 'මුරපදය ඉතා සාමාන්‍යයි, වඩාත් අනන්‍ය මුරපදයක් තෝරන්න',
        passwordReused: 'මුරපදය කලින් භාවිතා කර ඇත, වෙනත් මුරපදයක් තෝරන්න'
      },
      ta: {
        required: 'கடவுச்சொல் தேவை',
        tooShort: 'கடவுச்சொல் குறைந்தது {min} எழுத்துக்கள் இருக்க வேண்டும்',
        tooLong: 'கடவுச்சொல் {max} எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது',
        noLowercase: 'கடவுச்சொல்லில் குறைந்தது ஒரு சிறிய எழுத்து இருக்க வேண்டும்',
        noUppercase: 'கடவுச்சொல்லில் குறைந்தது ஒரு பெரிய எழுத்து இருக்க வேண்டும்',
        noNumbers: 'கடவுச்சொல்லில் குறைந்தது ஒரு எண் இருக்க வேண்டும்',
        noSpecialChars: 'கடவுச்சொல்லில் குறைந்தது ஒரு சிறப்பு எழுத்து இருக்க வேண்டும் (!@#$%^&*)',
        commonPassword: 'கடவுச்சொல் மிகவும் பொதுவானது, தனித்துவமான கடவுச்சொல்லைத் தேர்ந்தெடுக்கவும்',
        passwordReused: 'கடவுச்சொல் முன்பு பயன்படுத்தப்பட்டது, வேறு கடவுச்சொல்லைத் தேர்ந்தெடுக்கவும்'
      }
    };

    return messages[language] || messages.en;
  }

  /**
   * Generate password strength report
   * @param {string} password - Password to analyze
   * @param {string} language - Language for report
   * @returns {Object} Detailed strength report
   */
  static generatePasswordReport(password, language = 'en') {
    const validation = this.validatePasswordStrength(password, language);
    
    return {
      password: '***hidden***', // Never log actual password
      strength: validation.strength,
      score: validation.score,
      maxScore: 8,
      isValid: validation.isValid,
      requirements: validation.requirements,
      errors: validation.errors,
      recommendations: this.getPasswordRecommendations(validation, language),
      estimatedCrackTime: this.estimateCrackTime(password),
      securityLevel: this.getSecurityLevel(validation.score)
    };
  }

  /**
   * Get password recommendations based on validation
   * @param {Object} validation - Password validation result
   * @param {string} language - Language for recommendations
   * @returns {Array} Array of recommendations
   */
  static getPasswordRecommendations(validation, language = 'en') {
    const recommendations = [];
    const messages = this.getPasswordMessages(language);

    if (!validation.requirements.length) {
      recommendations.push(language === 'si' ? 'දිගු මුරපදයක් භාවිතා කරන්න (අවම අක්ෂර 12)' :
                          language === 'ta' ? 'நீண்ட கடவுச்சொல்லைப் பயன்படுத்தவும் (குறைந்தது 12 எழுத்துக்கள்)' :
                          'Use a longer password (minimum 12 characters)');
    }

    if (!validation.requirements.lowercase || !validation.requirements.uppercase) {
      recommendations.push(language === 'si' ? 'ලොකු හා කුඩා අකුරු මිශ්‍ර කරන්න' :
                          language === 'ta' ? 'பெரிய மற்றும் சிறிய எழுத்துக்களை கலக்கவும்' :
                          'Mix uppercase and lowercase letters');
    }

    if (!validation.requirements.numbers) {
      recommendations.push(language === 'si' ? 'සංඛ්‍යා ඇතුළත් කරන්න' :
                          language === 'ta' ? 'எண்களை சேர்க்கவும்' :
                          'Include numbers');
    }

    if (!validation.requirements.specialChars) {
      recommendations.push(language === 'si' ? 'විශේෂ අකුරු ඇතුළත් කරන්න (!@#$%^&*)' :
                          language === 'ta' ? 'சிறப்பு எழுத்துக்களை சேர்க்கவும் (!@#$%^&*)' :
                          'Include special characters (!@#$%^&*)');
    }

    if (!validation.requirements.noCommonPasswords) {
      recommendations.push(language === 'si' ? 'සාමාන්‍ය මුරපද වළකින්න' :
                          language === 'ta' ? 'பொதுவான கடவுச்சொற்களைத் தவிர்க்கவும்' :
                          'Avoid common passwords');
    }

    return recommendations;
  }

  /**
   * Estimate password crack time
   * @param {string} password - Password to analyze
   * @returns {string} Estimated crack time
   */
  static estimateCrackTime(password) {
    let charset = 0;
    
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/\d/.test(password)) charset += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) charset += 32;
    
    const combinations = Math.pow(charset, password.length);
    const seconds = combinations / (1000000 * 2); // Assume 1M guesses/sec, divide by 2 for average
    
    if (seconds < 60) return 'Less than a minute';
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.ceil(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.ceil(seconds / 86400)} days`;
    return `${Math.ceil(seconds / 31536000)} years`;
  }

  /**
   * Get security level based on score
   * @param {number} score - Password score
   * @returns {string} Security level
   */
  static getSecurityLevel(score) {
    if (score >= 7) return 'ENTERPRISE';
    if (score >= 5) return 'HIGH';
    if (score >= 3) return 'MEDIUM';
    if (score >= 1) return 'LOW';
    return 'VERY_LOW';
  }
}

module.exports = PasswordSecurity;
