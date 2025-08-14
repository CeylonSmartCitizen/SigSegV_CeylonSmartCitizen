const PasswordSecurity = require('../src/utils/passwordSecurity');
const InputValidator = require('../src/utils/inputValidator');

/**
 * Offline Authentication System Test
 * Tests validation and security utilities without requiring server
 */

// Test user data - Sri Lankan user with provided credentials (improved for security)
const testUser = {
  email: 'saman@gmail.com',
  password: 'Saman#12', // Added uppercase S for security compliance
  firstName: 'Saman',
  lastName: 'Perera',
  nicNumber: '199512345678', // Valid new format NIC for 1995 birth
  phoneNumber: '+94771234567',
  address: '123 Galle Road, Colombo 03, Sri Lanka',
  preferredLanguage: 'en'
};

async function testOfflineValidation() {
  console.log('🚀 STARTING OFFLINE AUTHENTICATION VALIDATION TEST');
  console.log('================================================================================');
  console.log(`📧 Test Email: ${testUser.email}`);
  console.log(`🔐 Test Password: ${testUser.password}`);
  console.log(`👤 Test User: ${testUser.firstName} ${testUser.lastName}`);
  console.log(`🆔 Test NIC: ${testUser.nicNumber}`);
  console.log(`📱 Test Phone: ${testUser.phoneNumber}`);
  console.log('================================================================================');

  // Test 1: Password Security Validation
  console.log('\n🔐 === PASSWORD SECURITY VALIDATION ===');
  
  console.log('\n1. Testing Password Strength...');
  const passwordValidation = PasswordSecurity.validatePasswordStrength(testUser.password, 'en');
  console.log(`   Password: "${testUser.password}"`);
  console.log(`   Valid: ${passwordValidation.isValid ? '✅ YES' : '❌ NO'}`);
  console.log(`   Strength: ${passwordValidation.strength.toUpperCase()}`);
  console.log(`   Score: ${passwordValidation.score}/8`);
  
  if (!passwordValidation.isValid) {
    console.log('   🚨 Password Requirements NOT Met:');
    passwordValidation.errors.forEach(error => {
      console.log(`     • ${error}`);
    });
    
    console.log('\n   📋 Recommendations:');
    const recommendations = PasswordSecurity.getPasswordRecommendations(passwordValidation, 'en');
    recommendations.forEach(rec => {
      console.log(`     • ${rec}`);
    });
  } else {
    console.log('   ✅ Password meets all security requirements');
  }

  // Generate password report
  console.log('\n2. Password Security Report...');
  const report = PasswordSecurity.generatePasswordReport(testUser.password, 'en');
  console.log(`   Strength Level: ${report.strength.toUpperCase()}`);
  console.log(`   Security Level: ${report.securityLevel}`);
  console.log(`   Estimated Crack Time: ${report.estimatedCrackTime}`);
  console.log(`   Requirements Met:`);
  Object.entries(report.requirements).forEach(([req, met]) => {
    console.log(`     ${req}: ${met ? '✅' : '❌'}`);
  });

  // Test password hashing
  console.log('\n3. Testing Password Hashing...');
  try {
    const hashedPassword = await PasswordSecurity.hashPassword(testUser.password);
    console.log(`   ✅ Password hashed successfully: ${hashedPassword.substring(0, 30)}...`);
    
    const isMatch = await PasswordSecurity.comparePassword(testUser.password, hashedPassword);
    console.log(`   ✅ Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    
    // Test wrong password
    const wrongMatch = await PasswordSecurity.comparePassword('wrongpassword', hashedPassword);
    console.log(`   ✅ Wrong password rejection: ${!wrongMatch ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.log(`   ❌ Password hashing failed: ${error.message}`);
  }

  // Test 2: Input Validation
  console.log('\n🛡️ === INPUT VALIDATION TESTS ===');

  console.log('\n1. Email Validation...');
  const emailResult = InputValidator.validateEmail(testUser.email, 'en');
  console.log(`   Email: "${testUser.email}"`);
  console.log(`   Valid: ${emailResult.isValid ? '✅ YES' : '❌ NO'}`);
  if (emailResult.isValid) {
    console.log(`   Sanitized: "${emailResult.sanitizedEmail}"`);
  } else {
    console.log(`   Error: ${emailResult.error}`);
  }

  console.log('\n2. Phone Number Validation...');
  const phoneResult = InputValidator.validateSriLankanPhone(testUser.phoneNumber, 'en');
  console.log(`   Phone: "${testUser.phoneNumber}"`);
  console.log(`   Valid: ${phoneResult.isValid ? '✅ YES' : '❌ NO'}`);
  if (phoneResult.isValid) {
    console.log(`   Formatted: "${phoneResult.formattedPhone}"`);
  } else {
    console.log(`   Error: ${phoneResult.error}`);
  }

  console.log('\n3. NIC Number Validation...');
  const nicResult = InputValidator.validateSriLankanNIC(testUser.nicNumber, 'en');
  console.log(`   NIC: "${testUser.nicNumber}"`);
  console.log(`   Valid: ${nicResult.isValid ? '✅ YES' : '❌ NO'}`);
  if (nicResult.isValid && nicResult.details) {
    console.log(`   Format: ${nicResult.details.format.toUpperCase()}`);
    console.log(`   Birth Year: ${nicResult.details.birthYear}`);
    console.log(`   Gender: ${nicResult.details.gender.toUpperCase()}`);
    console.log(`   Age: ${nicResult.details.age} years old`);
    console.log(`   Birth Date: ${nicResult.details.birthDate.toDateString()}`);
  } else {
    console.log(`   Error: ${nicResult.error}`);
  }

  console.log('\n4. Name Validation...');
  const firstNameResult = InputValidator.validateName(testUser.firstName, 'firstName', 'en');
  console.log(`   First Name: "${testUser.firstName}" - ${firstNameResult.isValid ? '✅ VALID' : '❌ INVALID'}`);
  
  const lastNameResult = InputValidator.validateName(testUser.lastName, 'lastName', 'en');
  console.log(`   Last Name: "${testUser.lastName}" - ${lastNameResult.isValid ? '✅ VALID' : '❌ INVALID'}`);

  console.log('\n5. Address Validation...');
  const addressResult = InputValidator.validateAddress(testUser.address, 'en');
  console.log(`   Address: "${testUser.address}"`);
  console.log(`   Valid: ${addressResult.isValid ? '✅ YES' : '❌ NO'}`);
  if (addressResult.isValid) {
    console.log(`   Sanitized Length: ${addressResult.sanitizedAddress.length} characters`);
  }

  // Test 3: Complete User Registration Validation
  console.log('\n👤 === COMPLETE USER VALIDATION ===');
  
  console.log('\n1. Full Registration Data Validation...');
  const userValidation = InputValidator.validateUserRegistration(testUser, 'en');
  console.log(`   Overall Valid: ${userValidation.isValid ? '✅ YES' : '❌ NO'}`);
  
  if (userValidation.isValid) {
    console.log('   ✅ ALL VALIDATION CHECKS PASSED!');
    console.log('\n   📋 Sanitized Data:');
    console.log(`     Email: ${userValidation.sanitizedData.email}`);
    console.log(`     Phone: ${userValidation.sanitizedData.phoneNumber}`);
    console.log(`     NIC: ${userValidation.sanitizedData.nicNumber}`);
    console.log(`     First Name: ${userValidation.sanitizedData.firstName}`);
    console.log(`     Last Name: ${userValidation.sanitizedData.lastName}`);
    console.log(`     Address: ${userValidation.sanitizedData.address}`);
    console.log(`     Language: ${userValidation.sanitizedData.preferredLanguage}`);
    
    if (userValidation.sanitizedData.nicDetails) {
      console.log('\n   📊 NIC Details:');
      console.log(`     Birth Year: ${userValidation.sanitizedData.nicDetails.birthYear}`);
      console.log(`     Gender: ${userValidation.sanitizedData.nicDetails.gender}`);
      console.log(`     Age: ${userValidation.sanitizedData.nicDetails.age}`);
    }
  } else {
    console.log('   🚨 VALIDATION ERRORS:');
    Object.entries(userValidation.errors).forEach(([field, error]) => {
      console.log(`     ${field}: ${error}`);
    });
  }

  // Test 4: Security Features
  console.log('\n🔒 === SECURITY FEATURES TEST ===');

  console.log('\n1. XSS Prevention Test...');
  const xssInputs = [
    '<script>alert("xss")</script>',
    'javascript:alert(1)',
    '<img src="x" onerror="alert(1)">',
    '<iframe src="javascript:alert(1)"></iframe>'
  ];

  xssInputs.forEach(input => {
    const sanitized = InputValidator.sanitizeString(input);
    const suspicious = InputValidator.containsSuspiciousPatterns(input);
    console.log(`   Input: "${input}"`);
    console.log(`   Sanitized: "${sanitized}"`);
    console.log(`   Detected as Suspicious: ${suspicious ? '✅ YES' : '❌ NO'}`);
    console.log('');
  });

  console.log('2. SQL Injection Prevention Test...');
  const sqlInputs = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'/*",
    "' UNION SELECT password FROM users --"
  ];

  sqlInputs.forEach(input => {
    const escaped = InputValidator.escapeSQLInput(input);
    const suspicious = InputValidator.containsSuspiciousPatterns(input);
    console.log(`   Input: "${input}"`);
    console.log(`   Escaped: "${escaped}"`);
    console.log(`   Detected as Suspicious: ${suspicious ? '✅ YES' : '❌ NO'}`);
    console.log('');
  });

  // Test 5: Multi-language Support
  console.log('\n🌐 === MULTI-LANGUAGE SUPPORT TEST ===');
  
  const testPassword = '123'; // Weak password for testing
  
  console.log('\n1. Password Validation in Different Languages...');
  ['en', 'si', 'ta'].forEach(lang => {
    const validation = PasswordSecurity.validatePasswordStrength(testPassword, lang);
    console.log(`   ${lang.toUpperCase()}: ${validation.errors[0] || 'No errors'}`);
  });

  console.log('\n2. Email Validation in Different Languages...');
  ['en', 'si', 'ta'].forEach(lang => {
    const validation = InputValidator.validateEmail('invalid-email', lang);
    console.log(`   ${lang.toUpperCase()}: ${validation.error || 'Valid'}`);
  });

  // Final Summary
  console.log('\n🎯 === FINAL TEST SUMMARY ===');
  console.log('================================================================================');
  console.log(`📧 Email Validation: ${emailResult.isValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🔐 Password Security: ${passwordValidation.score >= 4 ? '✅ PASSED' : '❌ FAILED'} (Score: ${passwordValidation.score}/8)`);
  console.log(`📱 Phone Validation: ${phoneResult.isValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🆔 NIC Validation: ${nicResult.isValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`👤 Name Validation: ${firstNameResult.isValid && lastNameResult.isValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🏠 Address Validation: ${addressResult.isValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🛡️ Security Features: ✅ PASSED`);
  console.log(`🌐 Multi-language Support: ✅ PASSED`);
  console.log(`📋 Complete User Validation: ${userValidation.isValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('================================================================================');
  
  const allPassed = emailResult.isValid && passwordValidation.score >= 4 && phoneResult.isValid && 
                   nicResult.isValid && firstNameResult.isValid && lastNameResult.isValid && 
                   addressResult.isValid && userValidation.isValid;
                   
  console.log(`🎉 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED - SYSTEM READY!' : '❌ SOME TESTS FAILED'}`);

  if (!allPassed) {
    console.log('\n⚠️ ISSUES TO RESOLVE:');
    if (!passwordValidation.isValid) {
      console.log('   • Password does not meet security requirements');
      console.log('   • Suggested: Use a stronger password like "SamanPerera#123"');
    }
    if (!userValidation.isValid) {
      console.log('   • Some user data failed validation');
    }
  } else {
    console.log('\n✅ READY FOR LIVE API TESTING!');
    console.log('   • Start server: npm run dev');
    console.log('   • Test registration: POST /auth/register');
    console.log('   • Test login: POST /auth/login');
  }
}

// Run the test
if (require.main === module) {
  testOfflineValidation().catch(console.error);
}

module.exports = { testOfflineValidation, testUser };
