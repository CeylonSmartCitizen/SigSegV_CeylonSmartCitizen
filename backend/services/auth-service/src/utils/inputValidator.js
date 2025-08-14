const validator = require('validator');
const xss = require('xss');
const { escape } = require('html-escaper');

/**
 * Input Sanitization and Validation Utility
 * Prevents SQL injection, XSS attacks, and validates input formats
 */
class InputValidator {
  
  /**
   * Sanitize string input to prevent XSS attacks
   * @param {string} input - Input string to sanitize
   * @param {Object} options - XSS filter options
   * @returns {string} Sanitized string
   */
  static sanitizeString(input, options = {}) {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Default XSS filter options
    const xssOptions = {
      whiteList: {}, // No HTML tags allowed by default
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
      ...options
    };

    // Remove XSS attempts and escape HTML entities
    const sanitized = xss(input.trim(), xssOptions);
    
    return escape(sanitized);
  }

  /**
   * Sanitize and validate email address
   * @param {string} email - Email to validate
   * @param {string} language - Language for error messages
   * @returns {Object} Validation result
   */
  static validateEmail(email, language = 'en') {
    const result = {
      isValid: false,
      sanitizedEmail: '',
      error: null
    };

    const messages = this.getValidationMessages(language);

    if (!email || typeof email !== 'string') {
      result.error = messages.email.required;
      return result;
    }

    // Sanitize email
    const sanitized = this.sanitizeString(email.toLowerCase().trim());
    result.sanitizedEmail = sanitized;

    // Validate email format
    if (!validator.isEmail(sanitized)) {
      result.error = messages.email.invalid;
      return result;
    }

    // Additional email security checks
    if (sanitized.length > 254) { // RFC 5321 limit
      result.error = messages.email.tooLong;
      return result;
    }

    // Check for suspicious patterns
    if (this.containsSuspiciousPatterns(sanitized)) {
      result.error = messages.email.suspicious;
      return result;
    }

    result.isValid = true;
    return result;
  }

  /**
   * Validate Sri Lankan phone number format (+94)
   * @param {string} phoneNumber - Phone number to validate
   * @param {string} language - Language for error messages
   * @returns {Object} Validation result
   */
  static validateSriLankanPhone(phoneNumber, language = 'en') {
    const result = {
      isValid: false,
      sanitizedPhone: '',
      formattedPhone: '',
      error: null
    };

    const messages = this.getValidationMessages(language);

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      result.error = messages.phone.required;
      return result;
    }

    // Sanitize phone number (remove all non-numeric except +)
    const sanitized = phoneNumber.replace(/[^\d+]/g, '');
    result.sanitizedPhone = sanitized;

    // Sri Lankan phone number patterns
    const patterns = [
      /^\+94[1-9]\d{8}$/, // +94xxxxxxxxx (11 digits total)
      /^94[1-9]\d{8}$/, // 94xxxxxxxxx (10 digits after country code)
      /^0[1-9]\d{8}$/, // 0xxxxxxxxx (local format)
      /^[1-9]\d{8}$/ // xxxxxxxxx (without leading 0)
    ];

    let formattedPhone = sanitized;

    // Convert to international format (+94)
    if (/^0[1-9]\d{8}$/.test(sanitized)) {
      // Local format: 0771234567 -> +94771234567
      formattedPhone = '+94' + sanitized.substring(1);
    } else if (/^[1-9]\d{8}$/.test(sanitized)) {
      // Without leading 0: 771234567 -> +94771234567
      formattedPhone = '+94' + sanitized;
    } else if (/^94[1-9]\d{8}$/.test(sanitized)) {
      // Country code without +: 94771234567 -> +94771234567
      formattedPhone = '+' + sanitized;
    }

    // Validate final format
    if (!/^\+94[1-9]\d{8}$/.test(formattedPhone)) {
      result.error = messages.phone.invalid;
      return result;
    }

    // Validate specific Sri Lankan mobile prefixes
    const validPrefixes = ['70', '71', '72', '75', '76', '77', '78'];
    const prefix = formattedPhone.substring(3, 5);
    
    if (!validPrefixes.includes(prefix)) {
      result.error = messages.phone.invalidPrefix;
      return result;
    }

    result.isValid = true;
    result.formattedPhone = formattedPhone;
    return result;
  }

  /**
   * Validate Sri Lankan NIC number format
   * @param {string} nicNumber - NIC number to validate
   * @param {string} language - Language for error messages
   * @returns {Object} Validation result
   */
  static validateSriLankanNIC(nicNumber, language = 'en') {
    const result = {
      isValid: false,
      sanitizedNIC: '',
      formattedNIC: '',
      error: null,
      details: null
    };

    const messages = this.getValidationMessages(language);

    if (!nicNumber || typeof nicNumber !== 'string') {
      result.error = messages.nic.required;
      return result;
    }

    // Sanitize NIC (remove spaces, convert to uppercase)
    const sanitized = this.sanitizeString(nicNumber.replace(/\s+/g, '').toUpperCase());
    result.sanitizedNIC = sanitized;

    // Sri Lankan NIC patterns
    const oldFormatPattern = /^(\d{9})([VvXx])$/; // 123456789V or 123456789X
    const newFormatPattern = /^(\d{12})$/; // 199812345678

    let isOldFormat = false;
    let isNewFormat = false;
    let birthYear, dayOfYear, gender;

    if (oldFormatPattern.test(sanitized)) {
      isOldFormat = true;
      const matches = sanitized.match(oldFormatPattern);
      const digits = matches[1];
      const suffix = matches[2].toUpperCase();

      // Extract birth year (first 2 digits + 1900 or 2000)
      const yearPrefix = parseInt(digits.substring(0, 2));
      birthYear = yearPrefix > 50 ? 1900 + yearPrefix : 2000 + yearPrefix;

      // Extract day of year (next 3 digits)
      dayOfYear = parseInt(digits.substring(2, 5));
      
      // Check if female (day > 500)
      if (dayOfYear > 500) {
        dayOfYear -= 500;
        gender = 'female';
      } else {
        gender = 'male';
      }

      result.formattedNIC = sanitized;

    } else if (newFormatPattern.test(sanitized)) {
      isNewFormat = true;
      
      // Extract birth year (first 4 digits)
      birthYear = parseInt(sanitized.substring(0, 4));
      
      // Extract day of year (next 3 digits)
      dayOfYear = parseInt(sanitized.substring(4, 7));
      
      // Check if female (day > 500)
      if (dayOfYear > 500) {
        dayOfYear -= 500;
        gender = 'female';
      } else {
        gender = 'male';
      }

      result.formattedNIC = sanitized;
    } else {
      result.error = messages.nic.invalid;
      return result;
    }

    // Validate day of year (1-366)
    if (dayOfYear < 1 || dayOfYear > 366) {
      result.error = messages.nic.invalidDay;
      return result;
    }

    // Validate birth year
    const currentYear = new Date().getFullYear();
    if (birthYear < 1900 || birthYear > currentYear) {
      result.error = messages.nic.invalidYear;
      return result;
    }

    // Calculate approximate birth date
    const birthDate = this.calculateBirthDate(birthYear, dayOfYear);

    result.isValid = true;
    result.details = {
      format: isOldFormat ? 'old' : 'new',
      birthYear,
      dayOfYear,
      gender,
      birthDate,
      age: currentYear - birthYear
    };

    return result;
  }

  /**
   * Sanitize general text input
   * @param {string} text - Text to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} Sanitized text
   */
  static sanitizeText(text, options = {}) {
    const defaults = {
      maxLength: 1000,
      allowHTML: false,
      trimWhitespace: true,
      removeDuplicateSpaces: true
    };

    const config = { ...defaults, ...options };

    if (!text || typeof text !== 'string') {
      return '';
    }

    let sanitized = text;

    // Trim whitespace
    if (config.trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Remove duplicate spaces
    if (config.removeDuplicateSpaces) {
      sanitized = sanitized.replace(/\s+/g, ' ');
    }

    // Handle HTML content
    if (!config.allowHTML) {
      sanitized = this.sanitizeString(sanitized);
    }

    // Truncate if too long
    if (sanitized.length > config.maxLength) {
      sanitized = sanitized.substring(0, config.maxLength);
    }

    return sanitized;
  }

  /**
   * Validate name fields (first name, last name)
   * @param {string} name - Name to validate
   * @param {string} type - Type of name ('firstName', 'lastName')
   * @param {string} language - Language for error messages
   * @returns {Object} Validation result
   */
  static validateName(name, type = 'name', language = 'en') {
    const result = {
      isValid: false,
      sanitizedName: '',
      error: null
    };

    const messages = this.getValidationMessages(language);

    if (!name || typeof name !== 'string') {
      result.error = messages.name.required;
      return result;
    }

    // Sanitize name
    const sanitized = this.sanitizeText(name, {
      maxLength: 50,
      allowHTML: false
    });

    result.sanitizedName = sanitized;

    // Validate name format (letters, spaces, hyphens, apostrophes)
    const namePattern = /^[a-zA-Z\u0D80-\u0DFF\u0B80-\u0BFF\s\-'\.]+$/;
    
    if (!namePattern.test(sanitized)) {
      result.error = messages.name.invalid;
      return result;
    }

    // Validate length
    if (sanitized.length < 2) {
      result.error = messages.name.tooShort;
      return result;
    }

    if (sanitized.length > 50) {
      result.error = messages.name.tooLong;
      return result;
    }

    result.isValid = true;
    return result;
  }

  /**
   * Validate address input
   * @param {string} address - Address to validate
   * @param {string} language - Language for error messages
   * @returns {Object} Validation result
   */
  static validateAddress(address, language = 'en') {
    const result = {
      isValid: false,
      sanitizedAddress: '',
      error: null
    };

    const messages = this.getValidationMessages(language);

    if (!address || typeof address !== 'string') {
      result.error = messages.address.required;
      return result;
    }

    // Sanitize address
    const sanitized = this.sanitizeText(address, {
      maxLength: 500,
      allowHTML: false
    });

    result.sanitizedAddress = sanitized;

    // Basic address validation
    if (sanitized.length < 10) {
      result.error = messages.address.tooShort;
      return result;
    }

    if (sanitized.length > 500) {
      result.error = messages.address.tooLong;
      return result;
    }

    result.isValid = true;
    return result;
  }

  /**
   * Check for suspicious patterns in input
   * @param {string} input - Input to check
   * @returns {boolean} True if suspicious patterns found
   */
  static containsSuspiciousPatterns(input) {
    const suspiciousPatterns = [
      // SQL injection patterns
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
      /('|"|;|--|\*|\/\*|\*\/)/,
      
      // XSS patterns
      /(<script|<iframe|<object|<embed|<link|<meta|<style)/i,
      /(javascript:|vbscript:|onload=|onerror=|onclick=)/i,
      
      // Path traversal
      /(\.\.\/|\.\.\\|%2e%2e|%252e%252e)/i,
      
      // Command injection
      /(\||&|;|\$\(|\`)/
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Calculate birth date from NIC details
   * @param {number} year - Birth year
   * @param {number} dayOfYear - Day of year
   * @returns {Date} Calculated birth date
   */
  static calculateBirthDate(year, dayOfYear) {
    const date = new Date(year, 0, dayOfYear);
    return date;
  }

  /**
   * Prevent SQL injection by escaping special characters
   * @param {string} input - Input to escape
   * @returns {string} Escaped input
   */
  static escapeSQLInput(input) {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/'/g, "''")
      .replace(/\\/g, "\\\\")
      .replace(/\x00/g, "\\0")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\x1a/g, "\\Z");
  }

  /**
   * Validate file upload input
   * @param {string} filename - Filename to validate
   * @param {Array} allowedExtensions - Allowed file extensions
   * @returns {Object} Validation result
   */
  static validateFileName(filename, allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']) {
    const result = {
      isValid: false,
      sanitizedName: '',
      error: null
    };

    if (!filename || typeof filename !== 'string') {
      result.error = 'Filename is required';
      return result;
    }

    // Sanitize filename
    const sanitized = filename
      .replace(/[^a-zA-Z0-9\-_\.]/g, '_') // Replace unsafe characters
      .replace(/\.+/g, '.') // Remove multiple dots
      .replace(/^\./, '') // Remove leading dot
      .substring(0, 255); // Limit length

    result.sanitizedName = sanitized;

    // Check file extension
    const extension = sanitized.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      result.error = `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`;
      return result;
    }

    // Check for suspicious patterns
    if (this.containsSuspiciousPatterns(sanitized)) {
      result.error = 'Filename contains suspicious content';
      return result;
    }

    result.isValid = true;
    return result;
  }

  /**
   * Get validation error messages in different languages
   * @param {string} language - Language code
   * @returns {Object} Localized messages
   */
  static getValidationMessages(language) {
    const messages = {
      en: {
        email: {
          required: 'Email address is required',
          invalid: 'Invalid email format',
          tooLong: 'Email address is too long',
          suspicious: 'Email contains suspicious content'
        },
        phone: {
          required: 'Phone number is required',
          invalid: 'Invalid Sri Lankan phone number format. Use +94xxxxxxxxx',
          invalidPrefix: 'Invalid mobile prefix. Must start with 70, 71, 72, 75, 76, 77, or 78'
        },
        nic: {
          required: 'NIC number is required',
          invalid: 'Invalid NIC format. Use 123456789V or 199812345678',
          invalidDay: 'Invalid day of year in NIC',
          invalidYear: 'Invalid birth year in NIC'
        },
        name: {
          required: 'Name is required',
          invalid: 'Name contains invalid characters',
          tooShort: 'Name must be at least 2 characters long',
          tooLong: 'Name must not exceed 50 characters'
        },
        address: {
          required: 'Address is required',
          tooShort: 'Address must be at least 10 characters long',
          tooLong: 'Address must not exceed 500 characters'
        }
      },
      si: {
        email: {
          required: 'ඊ-මේල් ලිපිනය අවශ්‍යයි',
          invalid: 'වලංගු නොවන ඊ-මේල් ආකෘතිය',
          tooLong: 'ඊ-මේල් ලිපිනය දිගු වැඩියි',
          suspicious: 'ඊ-මේල්එක සැක සහිත අන්තර්ගතයක් අඩංගුයි'
        },
        phone: {
          required: 'දුරකථන අංකය අවශ්‍යයි',
          invalid: 'වලංගු නොවන ශ්‍රී ලංකා දුරකථන අංක ආකෘතිය. +94xxxxxxxxx භාවිතා කරන්න',
          invalidPrefix: 'වලංගු නොවන ජංගම උපසර්ගය. 70, 71, 72, 75, 76, 77, හෝ 78 න් ආරම්භ විය යුතුය'
        },
        nic: {
          required: 'ජාතික හැඳුනුම්පත් අංකය අවශ්‍යයි',
          invalid: 'වලංගු නොවන ජාහැ ආකෘතිය. 123456789V හෝ 199812345678 භාවිතා කරන්න',
          invalidDay: 'ජාහැ වල වලංගු නොවන වසරේ දිනය',
          invalidYear: 'ජාහැ වල වලංගු නොවන උපන් වර්ෂය'
        },
        name: {
          required: 'නම අවශ්‍යයි',
          invalid: 'නමේ වලංගු නොවන අක්ෂර අඩංගුයි',
          tooShort: 'නම අවම වශයෙන් අක්ෂර 2ක් දිගු විය යුතුය',
          tooLong: 'නම අක්ෂර 50ට වඩා නොවිය යුතුය'
        },
        address: {
          required: 'ලිපිනය අවශ්‍යයි',
          tooShort: 'ලිපිනය අවම වශයෙන් අක්ෂර 10ක් දිගු විය යුතුය',
          tooLong: 'ලිපිනය අක්ෂර 500ට වඩා නොවිය යුතුය'
        }
      },
      ta: {
        email: {
          required: 'மின்னஞ்சல் முகவரி தேவை',
          invalid: 'தவறான மின்னஞ்சல் வடிவம்',
          tooLong: 'மின்னஞ்சல் முகவரி மிகவும் நீளமானது',
          suspicious: 'மின்னஞ்சலில் சந்தேகத்திற்குரிய உள்ளடக்கம் உள்ளது'
        },
        phone: {
          required: 'தொலைபேசி எண் தேவை',
          invalid: 'தவறான இலங்கை தொலைபேசி எண் வடிவம். +94xxxxxxxxx ஐ பயன்படுத்தவும்',
          invalidPrefix: 'தவறான மொபைல் முன்னொட்டு. 70, 71, 72, 75, 76, 77, அல்லது 78 உடன் தொடங்க வேண்டும்'
        },
        nic: {
          required: 'தேசிய அடையாள எண் தேவை',
          invalid: 'தவறான தேசிய அடையாள வடிவம். 123456789V அல்லது 199812345678 ஐ பயன்படுத்தவும்',
          invalidDay: 'தேசிய அடையாளத்தில் தவறான வருடத்தின் நாள்',
          invalidYear: 'தேசிய அடையாளத்தில் தவறான பிறந்த ஆண்டு'
        },
        name: {
          required: 'பெயர் தேவை',
          invalid: 'பெயரில் தவறான எழுத்துக்கள் உள்ளன',
          tooShort: 'பெயர் குறைந்தது 2 எழுத்துக்கள் இருக்க வேண்டும்',
          tooLong: 'பெயர் 50 எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது'
        },
        address: {
          required: 'முகவரி தேவை',
          tooShort: 'முகவரி குறைந்தது 10 எழுத்துக்கள் இருக்க வேண்டும்',
          tooLong: 'முகவரி 500 எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது'
        }
      }
    };

    return messages[language] || messages.en;
  }

  /**
   * Comprehensive input validation for user registration
   * @param {Object} userData - User registration data
   * @param {string} language - Language for error messages
   * @returns {Object} Validation result with all field validations
   */
  static validateUserRegistration(userData, language = 'en') {
    const result = {
      isValid: true,
      sanitizedData: {},
      errors: {},
      fieldValidations: {}
    };

    // Validate email
    const emailValidation = this.validateEmail(userData.email, language);
    result.fieldValidations.email = emailValidation;
    if (emailValidation.isValid) {
      result.sanitizedData.email = emailValidation.sanitizedEmail;
    } else {
      result.isValid = false;
      result.errors.email = emailValidation.error;
    }

    // Validate phone number
    if (userData.phoneNumber) {
      const phoneValidation = this.validateSriLankanPhone(userData.phoneNumber, language);
      result.fieldValidations.phone = phoneValidation;
      if (phoneValidation.isValid) {
        result.sanitizedData.phoneNumber = phoneValidation.formattedPhone;
      } else {
        result.isValid = false;
        result.errors.phoneNumber = phoneValidation.error;
      }
    }

    // Validate NIC number
    const nicValidation = this.validateSriLankanNIC(userData.nicNumber, language);
    result.fieldValidations.nic = nicValidation;
    if (nicValidation.isValid) {
      result.sanitizedData.nicNumber = nicValidation.formattedNIC;
      result.sanitizedData.nicDetails = nicValidation.details;
    } else {
      result.isValid = false;
      result.errors.nicNumber = nicValidation.error;
    }

    // Validate names
    const firstNameValidation = this.validateName(userData.firstName, 'firstName', language);
    result.fieldValidations.firstName = firstNameValidation;
    if (firstNameValidation.isValid) {
      result.sanitizedData.firstName = firstNameValidation.sanitizedName;
    } else {
      result.isValid = false;
      result.errors.firstName = firstNameValidation.error;
    }

    const lastNameValidation = this.validateName(userData.lastName, 'lastName', language);
    result.fieldValidations.lastName = lastNameValidation;
    if (lastNameValidation.isValid) {
      result.sanitizedData.lastName = lastNameValidation.sanitizedName;
    } else {
      result.isValid = false;
      result.errors.lastName = lastNameValidation.error;
    }

    // Validate address
    if (userData.address) {
      const addressValidation = this.validateAddress(userData.address, language);
      result.fieldValidations.address = addressValidation;
      if (addressValidation.isValid) {
        result.sanitizedData.address = addressValidation.sanitizedAddress;
      } else {
        result.isValid = false;
        result.errors.address = addressValidation.error;
      }
    }

    // Sanitize other fields
    if (userData.preferredLanguage) {
      result.sanitizedData.preferredLanguage = this.sanitizeText(userData.preferredLanguage, { maxLength: 10 });
    }

    return result;
  }
}

module.exports = InputValidator;
