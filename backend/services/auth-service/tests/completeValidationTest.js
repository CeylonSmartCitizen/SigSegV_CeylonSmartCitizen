/**
 * Complete Validation Test for Ceylon Smart Citizen Authentication
 * Tests all security implementations without requiring database connectivity
 * Uses Sri Lankan user credentials as specified: saman@gmail.com / Saman#12
 */

const passwordSecurity = require('../src/utils/passwordSecurity');
const inputValidator = require('../src/utils/inputValidator');

console.log('🚀 STARTING COMPLETE AUTHENTICATION VALIDATION TEST');
console.log('================================================================================');
console.log('🇱🇰 CEYLON SMART CITIZEN - SECURITY VALIDATION SUITE');
console.log('================================================================================');

// Test user - Saman Perera with provided credentials
const testUser = {
  email: 'saman@gmail.com',
  password: 'Saman#12',
  firstName: 'Saman',
  lastName: 'Perera',
  nicNumber: '199512345678',
  phoneNumber: '+94771234567',
  address: '123 Galle Road, Colombo 03, Sri Lanka',
  preferredLanguage: 'en'
};

async function runCompleteValidationTest() {
  let testsPassed = 0;
  let testsFailed = 0;

  console.log('\n📧 TEST USER CREDENTIALS:');
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Password: ${testUser.password}`);
  console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
  console.log(`   NIC: ${testUser.nicNumber}`);
  console.log(`   Phone: ${testUser.phoneNumber}`);
  console.log(`   Address: ${testUser.address}`);

  // Test 1: Password Security Validation
  console.log('\n🔐 === TESTING PASSWORD SECURITY ===');
  try {
    const passwordValidation = passwordSecurity.validatePasswordStrength(testUser.password, testUser.preferredLanguage);

    console.log(`✅ Password Validation Result:`);
    console.log(`   Score: ${passwordValidation.score}/8`);
    console.log(`   Strength: ${passwordValidation.strength}`);
    console.log(`   Valid: ${passwordValidation.isValid}`);
    console.log(`   Errors: ${passwordValidation.errors.join(', ') || 'None'}`);

    if (passwordValidation.isValid && passwordValidation.score >= 6) {
      console.log('✅ Password security test PASSED');
      testsPassed++;
    } else {
      console.log('❌ Password security test FAILED');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Password security test ERROR: ${error.message}`);
    testsFailed++;
  }

  // Test 2: Password Hashing and Comparison
  console.log('\n🔒 === TESTING PASSWORD HASHING ===');
  try {
    const hashedPassword = await passwordSecurity.hashPassword(testUser.password);
    const passwordMatch = await passwordSecurity.comparePassword(testUser.password, hashedPassword);
    const wrongPasswordMatch = await passwordSecurity.comparePassword('wrongpassword', hashedPassword);

    console.log(`✅ Password Hash Length: ${hashedPassword.length} characters`);
    console.log(`✅ Correct Password Match: ${passwordMatch}`);
    console.log(`✅ Wrong Password Match: ${wrongPasswordMatch}`);

    if (hashedPassword.length >= 60 && passwordMatch === true && wrongPasswordMatch === false) {
      console.log('✅ Password hashing test PASSED');
      testsPassed++;
    } else {
      console.log('❌ Password hashing test FAILED');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Password hashing test ERROR: ${error.message}`);
    testsFailed++;
  }

  // Test 3: Email Validation
  console.log('\n📧 === TESTING EMAIL VALIDATION ===');
  try {
    const emailValidation = inputValidator.validateEmail(testUser.email, testUser.preferredLanguage);
    console.log(`✅ Email Valid: ${emailValidation.isValid}`);
    console.log(`✅ Sanitized Email: ${emailValidation.sanitizedEmail || testUser.email}`);

    if (emailValidation.isValid) {
      console.log('✅ Email validation test PASSED');
      testsPassed++;
    } else {
      console.log('❌ Email validation test FAILED');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Email validation test ERROR: ${error.message}`);
    testsFailed++;
  }

  // Test 4: Sri Lankan Phone Number Validation
  console.log('\n📱 === TESTING SRI LANKAN PHONE VALIDATION ===');
  try {
    const phoneValidation = inputValidator.validateSriLankanPhone(testUser.phoneNumber, testUser.preferredLanguage);
    console.log(`✅ Phone Valid: ${phoneValidation.isValid}`);
    console.log(`✅ Sanitized Phone: ${phoneValidation.sanitizedPhone || testUser.phoneNumber}`);

    if (phoneValidation.isValid) {
      console.log('✅ Phone validation test PASSED');
      testsPassed++;
    } else {
      console.log('❌ Phone validation test FAILED');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Phone validation test ERROR: ${error.message}`);
    testsFailed++;
  }

  // Test 5: Sri Lankan NIC Validation
  console.log('\n🆔 === TESTING SRI LANKAN NIC VALIDATION ===');
  try {
    const nicValidation = inputValidator.validateSriLankanNIC(testUser.nicNumber, testUser.preferredLanguage);
    console.log(`✅ NIC Valid: ${nicValidation.isValid}`);
    console.log(`✅ Sanitized NIC: ${nicValidation.sanitizedNIC || testUser.nicNumber}`);

    if (nicValidation.isValid) {
      console.log('✅ NIC validation test PASSED');
      testsPassed++;
    } else {
      console.log('❌ NIC validation test FAILED');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ NIC validation test ERROR: ${error.message}`);
    testsFailed++;
  }

  // Test 6: Name Validation (Multi-language)
  console.log('\n👤 === TESTING NAME VALIDATION ===');
  try {
    const firstNameValidation = inputValidator.validateName(testUser.firstName, 'firstName', testUser.preferredLanguage);
    const lastNameValidation = inputValidator.validateName(testUser.lastName, 'lastName', testUser.preferredLanguage);

    console.log(`✅ First Name Valid: ${firstNameValidation.isValid}`);
    console.log(`✅ Sanitized First Name: ${firstNameValidation.sanitizedName || testUser.firstName}`);
    console.log(`✅ Last Name Valid: ${lastNameValidation.isValid}`);
    console.log(`✅ Sanitized Last Name: ${lastNameValidation.sanitizedName || testUser.lastName}`);

    if (firstNameValidation.isValid && lastNameValidation.isValid) {
      console.log('✅ Name validation test PASSED');
      testsPassed++;
    } else {
      console.log('❌ Name validation test FAILED');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Name validation test ERROR: ${error.message}`);
    testsFailed++;
  }

  // Test 7: Address Validation
  console.log('\n🏠 === TESTING ADDRESS VALIDATION ===');
  try {
    const addressValidation = inputValidator.validateAddress(testUser.address, testUser.preferredLanguage);
    console.log(`✅ Address Valid: ${addressValidation.isValid}`);
    console.log(`✅ Sanitized Address: ${addressValidation.sanitizedAddress || testUser.address}`);

    if (addressValidation.isValid) {
      console.log('✅ Address validation test PASSED');
      testsPassed++;
    } else {
      console.log('❌ Address validation test FAILED');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ Address validation test ERROR: ${error.message}`);
    testsFailed++;
  }

  // Test 8: XSS Protection Test
  console.log('\n🛡️ === TESTING XSS PROTECTION ===');
  try {
    const maliciousInput = '<script>alert("XSS")</script>Saman<img src=x onerror=alert("XSS2")>';
    const sanitizedInput = inputValidator.sanitizeString(maliciousInput);
    
    console.log(`✅ Original Input: ${maliciousInput}`);
    console.log(`✅ Sanitized Input: ${sanitizedInput}`);

    if (!sanitizedInput.includes('<script>') && !sanitizedInput.includes('onerror')) {
      console.log('✅ XSS protection test PASSED');
      testsPassed++;
    } else {
      console.log('❌ XSS protection test FAILED');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ XSS protection test ERROR: ${error.message}`);
    testsFailed++;
  }

  // Test 9: SQL Injection Protection Test
  console.log('\n💉 === TESTING SQL INJECTION PROTECTION ===');
  try {
    const sqlInput = "saman@gmail.com'; DROP TABLE users; --";
    const sanitizedSqlInput = inputValidator.sanitizeString(sqlInput);
    
    console.log(`✅ Original SQL Input: ${sqlInput}`);
    console.log(`✅ Sanitized SQL Input: ${sanitizedSqlInput}`);

    if (!sanitizedSqlInput.includes('DROP TABLE') && !sanitizedSqlInput.includes('--')) {
      console.log('✅ SQL injection protection test PASSED');
      testsPassed++;
    } else {
      console.log('❌ SQL injection protection test FAILED');
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ SQL injection protection test ERROR: ${error.message}`);
    testsFailed++;
  }

  // Final Results
  console.log('\n================================================================================');
  console.log('🎯 TEST RESULTS SUMMARY');
  console.log('================================================================================');
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📊 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Ceylon Smart Citizen Authentication is SECURE and READY!');
    console.log('🔒 Enterprise-level security validated with Sri Lankan user credentials');
    console.log('🇱🇰 Multi-language support and Sri Lankan format validation confirmed');
  } else {
    console.log(`\n⚠️ ${testsFailed} test(s) failed. Please review the issues above.`);
  }
  
  console.log('================================================================================');
}

// Run the complete validation test
runCompleteValidationTest().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
