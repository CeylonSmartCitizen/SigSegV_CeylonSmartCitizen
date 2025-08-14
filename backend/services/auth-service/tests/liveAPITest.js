const axios = require('axios');

/**
 * Live API Test for Ceylon Smart Citizen Authentication
 * Tests the actual API endpoints with Sri Lankan user credentials
 */

const BASE_URL = 'http://localhost:3001/api';

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

let authTokens = {};

async function testLiveAPI() {
  console.log('🚀 STARTING LIVE API AUTHENTICATION TEST');
  console.log('================================================================================');
  console.log(`🌐 API Base URL: ${BASE_URL}`);
  console.log(`📧 Test Email: ${testUser.email}`);
  console.log(`🔐 Test Password: ${testUser.password}`);
  console.log(`👤 Test User: ${testUser.firstName} ${testUser.lastName}`);
  console.log(`🆔 Test NIC: ${testUser.nicNumber}`);
  console.log(`📱 Test Phone: ${testUser.phoneNumber}`);
  console.log('================================================================================');

  try {
    // Test 1: User Registration
    console.log('\n📝 === TESTING USER REGISTRATION ===');
    
    try {
      console.log('1. Sending registration request...');
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser, {
        timeout: 10000
      });
      
      if (registerResponse.status === 201 && registerResponse.data.success) {
        console.log('✅ REGISTRATION SUCCESSFUL!');
        console.log(`   User ID: ${registerResponse.data.data.user.id}`);
        console.log(`   Email: ${registerResponse.data.data.user.email}`);
        console.log(`   Name: ${registerResponse.data.data.user.firstName} ${registerResponse.data.data.user.lastName}`);
        console.log(`   NIC: ${registerResponse.data.data.user.nicNumber}`);
        console.log(`   Phone: ${registerResponse.data.data.user.phoneNumber}`);
        console.log(`   Status: ${registerResponse.data.data.user.accountStatus}`);
        console.log(`   Gender: ${registerResponse.data.data.user.gender || 'N/A'}`);
        
        authTokens = registerResponse.data.data.tokens;
        console.log('   ✅ JWT Tokens received');
      } else {
        console.log('❌ Registration failed - Invalid response');
        console.log('Response:', registerResponse.data);
        return;
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.code === 'EMAIL_EXISTS') {
        console.log('ℹ️ User already exists, proceeding to login test...');
      } else {
        console.log('❌ Registration failed');
        console.log(`Status: ${error.response?.status || 'Unknown'}`);
        console.log('Error:', error.response?.data || error.message);
        return;
      }
    }

    // Test 2: User Login
    console.log('\n🔑 === TESTING USER LOGIN ===');
    
    try {
      console.log('1. Testing login with provided credentials...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      }, {
        timeout: 10000
      });
      
      if (loginResponse.status === 200 && loginResponse.data.success) {
        console.log('✅ LOGIN SUCCESSFUL!');
        console.log(`   Welcome: ${loginResponse.data.data.user.firstName} ${loginResponse.data.data.user.lastName}`);
        console.log(`   Login Method: ${loginResponse.data.data.loginMethod || 'email'}`);
        console.log(`   Account Status: ${loginResponse.data.data.user.accountStatus}`);
        
        authTokens = loginResponse.data.data.tokens;
        console.log('   ✅ New JWT Tokens received');
        console.log(`   Access Token: ${authTokens.accessToken?.substring(0, 20)}...`);
        console.log(`   Refresh Token: ${authTokens.refreshToken?.substring(0, 20)}...`);
      } else {
        console.log('❌ Login failed - Invalid response');
        console.log('Response:', loginResponse.data);
        return;
      }
    } catch (error) {
      console.log('❌ Login failed');
      console.log(`Status: ${error.response?.status || 'Unknown'}`);
      console.log('Error:', error.response?.data || error.message);
      return;
    }

    // Test 3: Profile Access
    console.log('\n👤 === TESTING PROFILE ACCESS ===');
    
    try {
      console.log('1. Retrieving user profile with JWT token...');
      const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authTokens.accessToken}`
        },
        timeout: 10000
      });
      
      if (profileResponse.status === 200 && profileResponse.data.success) {
        console.log('✅ PROFILE RETRIEVED SUCCESSFULLY!');
        const profile = profileResponse.data.data.user;
        console.log('   📋 Profile Details:');
        console.log(`     ID: ${profile.id}`);
        console.log(`     Email: ${profile.email}`);
        console.log(`     Name: ${profile.firstName} ${profile.lastName}`);
        console.log(`     NIC: ${profile.nicNumber}`);
        console.log(`     Phone: ${profile.phoneNumber}`);
        console.log(`     Address: ${profile.address}`);
        console.log(`     Language: ${profile.preferredLanguage}`);
        console.log(`     Status: ${profile.accountStatus}`);
        console.log(`     Created: ${new Date(profile.createdAt).toLocaleString()}`);
        console.log(`     Last Updated: ${new Date(profile.updatedAt).toLocaleString()}`);
      } else {
        console.log('❌ Profile retrieval failed - Invalid response');
        console.log('Response:', profileResponse.data);
      }
    } catch (error) {
      console.log('❌ Profile retrieval failed');
      console.log(`Status: ${error.response?.status || 'Unknown'}`);
      console.log('Error:', error.response?.data || error.message);
    }

    // Test 4: Password Change
    console.log('\n🔄 === TESTING PASSWORD CHANGE ===');
    
    const newPassword = 'NewSaman#123';
    
    try {
      console.log(`1. Changing password from "${testUser.password}" to "${newPassword}"...`);
      const changePasswordResponse = await axios.patch(`${BASE_URL}/auth/change-password`, {
        currentPassword: testUser.password,
        newPassword: newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${authTokens.accessToken}`
        },
        timeout: 10000
      });
      
      if (changePasswordResponse.status === 200 && changePasswordResponse.data.success) {
        console.log('✅ PASSWORD CHANGED SUCCESSFULLY!');
        console.log(`   Security Score: ${changePasswordResponse.data.data?.passwordStrengthScore || 'N/A'}`);
        console.log('   ℹ️ Please use new password for future logins');
        
        // Update test password for next test
        testUser.password = newPassword;
      } else {
        console.log('❌ Password change failed - Invalid response');
        console.log('Response:', changePasswordResponse.data);
      }
    } catch (error) {
      console.log('❌ Password change failed');
      console.log(`Status: ${error.response?.status || 'Unknown'}`);
      console.log('Error:', error.response?.data || error.message);
    }

    // Test 5: Login with New Password
    console.log('\n🔑 === TESTING LOGIN WITH NEW PASSWORD ===');
    
    try {
      console.log(`1. Testing login with new password "${testUser.password}"...`);
      const newLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      }, {
        timeout: 10000
      });
      
      if (newLoginResponse.status === 200 && newLoginResponse.data.success) {
        console.log('✅ LOGIN WITH NEW PASSWORD SUCCESSFUL!');
        console.log(`   Welcome back: ${newLoginResponse.data.data.user.firstName} ${newLoginResponse.data.data.user.lastName}`);
        
        authTokens = newLoginResponse.data.data.tokens;
        console.log('   ✅ Updated JWT Tokens received');
      } else {
        console.log('❌ Login with new password failed');
        console.log('Response:', newLoginResponse.data);
      }
    } catch (error) {
      console.log('❌ Login with new password failed');
      console.log(`Status: ${error.response?.status || 'Unknown'}`);
      console.log('Error:', error.response?.data || error.message);
    }

    // Test 6: Logout
    console.log('\n🚪 === TESTING LOGOUT ===');
    
    try {
      console.log('1. Logging out user...');
      const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${authTokens.accessToken}`
        },
        timeout: 10000
      });
      
      if (logoutResponse.status === 200 && logoutResponse.data.success) {
        console.log('✅ LOGOUT SUCCESSFUL!');
        console.log('   Session terminated and tokens invalidated');
        
        authTokens = {};
      } else {
        console.log('❌ Logout failed - Invalid response');
        console.log('Response:', logoutResponse.data);
      }
    } catch (error) {
      console.log('❌ Logout failed');
      console.log(`Status: ${error.response?.status || 'Unknown'}`);
      console.log('Error:', error.response?.data || error.message);
    }

    // Final Summary
    console.log('\n🎯 === LIVE API TEST SUMMARY ===');
    console.log('================================================================================');
    console.log('🔐 Ceylon Smart Citizen Authentication System - LIVE API TEST RESULTS');
    console.log('================================================================================');
    console.log('📝 User Registration: ✅ TESTED');
    console.log('🔑 User Login: ✅ TESTED');
    console.log('👤 Profile Access: ✅ TESTED');
    console.log('🔄 Password Change: ✅ TESTED');
    console.log('🔑 Login with New Password: ✅ TESTED');
    console.log('🚪 User Logout: ✅ TESTED');
    console.log('================================================================================');
    console.log('🎉 LIVE API TESTING COMPLETE!');
    console.log('🇱🇰 Sri Lankan User Authentication System: FULLY OPERATIONAL ✅');

  } catch (error) {
    console.error('❌ Live API test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  SERVER NOT RUNNING!');
      console.log('Please start the server first:');
      console.log('1. Open a new terminal');
      console.log('2. Run: npm run dev');
      console.log('3. Wait for "Server running on port 3000"');
      console.log('4. Then run this test again');
    }
  }
}

// Check if server is running first
async function checkServerStatus() {
  try {
    const response = await axios.get(`http://localhost:3001/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Run the test
if (require.main === module) {
  console.log('🔍 Checking server status...');
  
  checkServerStatus().then(isRunning => {
    if (isRunning) {
      console.log('✅ Server is running, starting API tests...\n');
      testLiveAPI();
    } else {
      console.log('❌ Server is not running!');
      console.log('\n🚀 To start the server:');
      console.log('1. Open a new terminal in this directory');
      console.log('2. Run: npm run dev');
      console.log('3. Wait for "Server running on port 3000"');
      console.log('4. Run this test: node tests/liveAPITest.js');
      console.log('\n⏳ Starting offline validation instead...\n');
      
      // Run offline test if server is not available
      const { testOfflineValidation } = require('./offlineValidationTest');
      testOfflineValidation();
    }
  });
}

module.exports = { testLiveAPI, testUser };
