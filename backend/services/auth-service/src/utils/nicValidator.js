/**
 * Sri Lankan NIC (National Identity Card) validation utility
 * Supports both old format (9 digits + V/X) and new format (12 digits)
 */

class NICValidator {
  // Regex patterns for NIC validation
  static OLD_FORMAT_REGEX = /^[0-9]{9}[VvXx]$/;
  static NEW_FORMAT_REGEX = /^[0-9]{12}$/;
  
  // Error messages in multiple languages
  static ERROR_MESSAGES = {
    en: {
      REQUIRED: 'NIC number is required',
      INVALID_FORMAT: 'Invalid NIC format. Must be 9 digits + V/X or 12 digits',
      INVALID_DAY_OF_YEAR: 'Invalid day of year in NIC',
      INVALID_BIRTH_YEAR: 'Invalid birth year in NIC',
      INVALID_DAY_FOR_YEAR: 'Invalid day for the specified year',
      VALIDATION_ERROR: 'Error validating NIC number',
      DUPLICATE_NIC: 'This NIC number is already registered',
      UNDERAGE: 'You must be at least 16 years old to register'
    },
    si: {
      REQUIRED: 'ජාතික හැඳුනුම්පත් අංකය අවශ්‍යයි',
      INVALID_FORMAT: 'වලංගු නොවන ජාතික හැඳුනුම්පත් ආකෘතිය. අංක 9ක් + V/X හෝ අංක 12ක් විය යුතුය',
      INVALID_DAY_OF_YEAR: 'ජාතික හැඳුනුම්පතේ වලංගු නොවන දින අංකය',
      INVALID_BIRTH_YEAR: 'ජාතික හැඳුනුම්පතේ වලංගු නොවන උපන් වර්ෂය',
      INVALID_DAY_FOR_YEAR: 'නියමිත වර්ෂය සඳහා වලංගු නොවන දිනය',
      VALIDATION_ERROR: 'ජාතික හැඳුනුම්පත් සත්‍යාපනයේ දෝෂයක්',
      DUPLICATE_NIC: 'මෙම ජාතික හැඳුනුම්පත් අංකය දැනටමත් ලියාපදිංචි කර ඇත',
      UNDERAGE: 'ලියාපදිංචි වීමට අවම වශයෙන් වයස අවුරුදු 16ක් විය යුතුය'
    },
    ta: {
      REQUIRED: 'தேசிய அடையாள அட்டை எண் தேவை',
      INVALID_FORMAT: 'தவறான தேசிய அடையாள அட்டை வடிவம். 9 இலக்கங்கள் + V/X அல்லது 12 இலக்கங்கள் இருக்க வேண்டும்',
      INVALID_DAY_OF_YEAR: 'தேசிய அடையாள அட்டையில் தவறான நாள் எண்',
      INVALID_BIRTH_YEAR: 'தேசிய அடையாள அட்டையில் தவறான பிறந்த ஆண்டு',
      INVALID_DAY_FOR_YEAR: 'குறிப்பிட்ட ஆண்டிற்கு தவறான நாள்',
      VALIDATION_ERROR: 'தேசிய அடையாள அட்டை சரிபார்ப்பில் பிழை',
      DUPLICATE_NIC: 'இந்த தேசிய அடையாள அட்டை எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது',
      UNDERAGE: 'பதிவு செய்வதற்கு குறைந்தது 16 வயது இருக்க வேண்டும்'
    }
  };

  /**
   * Validate Sri Lankan NIC number with comprehensive checks
   * @param {string} nic - NIC number to validate
   * @param {string} language - Language for error messages ('en', 'si', 'ta')
   * @returns {Object} Validation result with details
   */
  static validate(nic, language = 'en') {
    const messages = this.ERROR_MESSAGES[language] || this.ERROR_MESSAGES.en;

    if (!nic || typeof nic !== 'string') {
      return {
        isValid: false,
        error: messages.REQUIRED,
        code: 'NIC_REQUIRED'
      };
    }

    // Remove spaces and convert to uppercase
    nic = nic.trim().toUpperCase();

    // Check format using regex patterns
    if (this.OLD_FORMAT_REGEX.test(nic)) {
      return this.validateOldFormat(nic, language);
    } else if (this.NEW_FORMAT_REGEX.test(nic)) {
      return this.validateNewFormat(nic, language);
    } else {
      return {
        isValid: false,
        error: messages.INVALID_FORMAT,
        code: 'INVALID_FORMAT'
      };
    }
  }

  /**
   * Validate old format NIC (XXXXXXXXXV/X)
   * @param {string} nic - Old format NIC
   * @param {string} language - Language for error messages
   * @returns {Object} Validation result
   */
  static validateOldFormat(nic, language = 'en') {
    const messages = this.ERROR_MESSAGES[language] || this.ERROR_MESSAGES.en;
    
    try {
      const digits = nic.substring(0, 9);
      const suffix = nic.substring(9);

      // Extract birth year, day of year, and serial number
      const year = parseInt(digits.substring(0, 2));
      const dayOfYear = parseInt(digits.substring(2, 5));
      const serialNumber = parseInt(digits.substring(5, 9));

      // Determine full year (assume 1900-1999 for old format)
      // Years 00-99 map to 1900-1999
      const fullYear = 1900 + year;

      // Validate day of year (1-366 for leap years, 1-500 for males, 501-866 for females)
      if (dayOfYear < 1 || dayOfYear > 866) {
        return {
          isValid: false,
          error: messages.INVALID_DAY_OF_YEAR,
          code: 'INVALID_DAY_OF_YEAR'
        };
      }

      // Determine gender and actual birth day
      const isFemale = dayOfYear > 500;
      const actualDay = isFemale ? dayOfYear - 500 : dayOfYear;
      const gender = isFemale ? 'female' : 'male';

      // Validate that the day exists in the year
      const maxDaysInYear = this.isLeapYear(fullYear) ? 366 : 365;
      if (actualDay > maxDaysInYear) {
        return {
          isValid: false,
          error: messages.INVALID_DAY_FOR_YEAR,
          code: 'INVALID_DAY_FOR_YEAR'
        };
      }

      // Calculate age and check minimum age requirement
      const currentYear = new Date().getFullYear();
      const age = currentYear - fullYear;
      
      // Calculate exact birth date for more precise age calculation
      const birthDate = this.calculateBirthDate(fullYear, actualDay);
      const exactAge = this.calculateExactAge(birthDate);

      // Check minimum age (16 years for most services)
      if (exactAge < 16) {
        return {
          isValid: false,
          error: messages.UNDERAGE,
          code: 'UNDERAGE',
          details: {
            age: exactAge,
            minimumAge: 16
          }
        };
      }

      return {
        isValid: true,
        details: {
          format: 'old',
          birthYear: fullYear,
          birthDate: birthDate,
          dayOfYear: actualDay,
          gender: gender,
          age: exactAge,
          serialNumber: serialNumber,
          isEligible: exactAge >= 16,
          formattedNIC: nic
        }
      };

    } catch (error) {
      return {
        isValid: false,
        error: messages.VALIDATION_ERROR,
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Validate new format NIC (12 digits)
   * @param {string} nic - New format NIC
   * @param {string} language - Language for error messages
   * @returns {Object} Validation result
   */
  static validateNewFormat(nic, language = 'en') {
    const messages = this.ERROR_MESSAGES[language] || this.ERROR_MESSAGES.en;
    
    try {
      // Extract birth year, day of year, and serial number
      const year = parseInt(nic.substring(0, 4));
      const dayOfYear = parseInt(nic.substring(4, 7));
      const serialNumber = parseInt(nic.substring(7, 11));

      // Validate year (reasonable range - 1900 to current year)
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        return {
          isValid: false,
          error: messages.INVALID_BIRTH_YEAR,
          code: 'INVALID_BIRTH_YEAR'
        };
      }

      // Validate day of year (1-366 for leap years, 1-500 for males, 501-866 for females)
      if (dayOfYear < 1 || dayOfYear > 866) {
        return {
          isValid: false,
          error: messages.INVALID_DAY_OF_YEAR,
          code: 'INVALID_DAY_OF_YEAR'
        };
      }

      // Determine gender and actual birth day
      const isFemale = dayOfYear > 500;
      const actualDay = isFemale ? dayOfYear - 500 : dayOfYear;
      const gender = isFemale ? 'female' : 'male';

      // Validate that the day exists in the year
      const maxDaysInYear = this.isLeapYear(year) ? 366 : 365;
      if (actualDay > maxDaysInYear) {
        return {
          isValid: false,
          error: messages.INVALID_DAY_FOR_YEAR,
          code: 'INVALID_DAY_FOR_YEAR'
        };
      }

      // Calculate exact birth date and age
      const birthDate = this.calculateBirthDate(year, actualDay);
      const exactAge = this.calculateExactAge(birthDate);

      // Check minimum age (16 years for most services)
      if (exactAge < 16) {
        return {
          isValid: false,
          error: messages.UNDERAGE,
          code: 'UNDERAGE',
          details: {
            age: exactAge,
            minimumAge: 16
          }
        };
      }

      return {
        isValid: true,
        details: {
          format: 'new',
          birthYear: year,
          birthDate: birthDate,
          dayOfYear: actualDay,
          gender: gender,
          age: exactAge,
          serialNumber: serialNumber,
          isEligible: exactAge >= 16,
          formattedNIC: nic
        }
      };

    } catch (error) {
      return {
        isValid: false,
        error: messages.VALIDATION_ERROR,
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Check if a year is a leap year
   * @param {number} year - Year to check
   * @returns {boolean} True if leap year
   */
  static isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Calculate birth date from year and day of year
   * @param {number} year - Birth year
   * @param {number} dayOfYear - Day of year (1-366)
   * @returns {Date} Birth date
   */
  static calculateBirthDate(year, dayOfYear) {
    const date = new Date(year, 0, 1); // January 1st of birth year
    date.setDate(dayOfYear); // Add days to get actual birth date
    return date;
  }

  /**
   * Calculate exact age in years (with decimal precision)
   * @param {Date} birthDate - Birth date
   * @returns {number} Age in years
   */
  static calculateExactAge(birthDate) {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }

  /**
   * Check if NIC number already exists in database
   * @param {string} nic - NIC number to check
   * @param {Object} db - Database connection object
   * @param {string} excludeUserId - User ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if NIC exists
   */
  static async checkDuplicateNIC(nic, db, excludeUserId = null) {
    try {
      const formattedNIC = this.format(nic);
      let query = 'SELECT id FROM users WHERE nic_number = $1';
      const params = [formattedNIC];

      if (excludeUserId) {
        query += ' AND id != $2';
        params.push(excludeUserId);
      }

      const result = await db.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking duplicate NIC:', error);
      throw error;
    }
  }

  /**
   * Comprehensive NIC validation with database duplicate check
   * @param {string} nic - NIC number to validate
   * @param {Object} db - Database connection object
   * @param {string} language - Language for error messages
   * @param {string} excludeUserId - User ID to exclude from duplicate check
   * @returns {Promise<Object>} Complete validation result
   */
  static async validateWithDatabaseCheck(nic, db, language = 'en', excludeUserId = null) {
    const messages = this.ERROR_MESSAGES[language] || this.ERROR_MESSAGES.en;

    // First, validate format and structure
    const formatValidation = this.validate(nic, language);
    if (!formatValidation.isValid) {
      return formatValidation;
    }

    // Check for duplicate in database
    try {
      const isDuplicate = await this.checkDuplicateNIC(nic, db, excludeUserId);
      if (isDuplicate) {
        return {
          isValid: false,
          error: messages.DUPLICATE_NIC,
          code: 'DUPLICATE_NIC'
        };
      }

      // Return successful validation with all details
      return formatValidation;
    } catch (error) {
      return {
        isValid: false,
        error: messages.VALIDATION_ERROR,
        code: 'DATABASE_ERROR'
      };
    }
  }

  /**
   * Get age eligibility for different services
   * @param {number} age - Person's age
   * @returns {Object} Service eligibility information
   */
  static getServiceEligibility(age) {
    return {
      canRegister: age >= 16,
      canApplyNIC: age >= 16,
      canApplyPassport: age >= 18,
      canApplyDrivingLicense: age >= 18,
      canVote: age >= 18,
      canMarry: age >= 18,
      eligibilityDetails: {
        minimumAgeForRegistration: 16,
        minimumAgeForNIC: 16,
        minimumAgeForPassport: 18,
        minimumAgeForDrivingLicense: 18,
        minimumAgeForVoting: 18,
        minimumAgeForMarriage: 18
      }
    };
  }

  /**
   * Format NIC number for consistent storage
   * @param {string} nic - Raw NIC number
   * @returns {string} Formatted NIC number
   */
  static format(nic) {
    if (!nic) return null;
    return nic.trim().toUpperCase().replace(/\s+/g, '');
  }

  /**
   * Generate a formatted birth date from NIC
   * @param {string} nic - Valid NIC number
   * @returns {Date|null} Birth date or null if invalid
   */
  static extractBirthDate(nic) {
    const validation = this.validate(nic);
    if (!validation.isValid) return null;

    return validation.details.birthDate;
  }

  /**
   * Extract all personal information from NIC
   * @param {string} nic - Valid NIC number
   * @param {string} language - Language for output
   * @returns {Object|null} Personal information or null if invalid
   */
  static extractPersonalInfo(nic, language = 'en') {
    const validation = this.validate(nic, language);
    if (!validation.isValid) return null;

    const { details } = validation;
    const eligibility = this.getServiceEligibility(details.age);

    return {
      nic: details.formattedNIC,
      format: details.format,
      birthDate: details.birthDate,
      birthYear: details.birthYear,
      age: details.age,
      gender: details.gender,
      dayOfYear: details.dayOfYear,
      serialNumber: details.serialNumber,
      isEligibleForRegistration: eligibility.canRegister,
      serviceEligibility: eligibility,
      generatedAt: new Date()
    };
  }

  /**
   * Validate multiple NICs at once
   * @param {Array<string>} nics - Array of NIC numbers
   * @param {string} language - Language for error messages
   * @returns {Array<Object>} Array of validation results
   */
  static validateMultiple(nics, language = 'en') {
    if (!Array.isArray(nics)) {
      return [{ isValid: false, error: 'Input must be an array', code: 'INVALID_INPUT' }];
    }

    return nics.map((nic, index) => ({
      index,
      nic,
      ...this.validate(nic, language)
    }));
  }
}

module.exports = NICValidator;