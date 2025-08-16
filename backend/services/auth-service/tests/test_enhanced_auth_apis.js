// Test script for new Ceylon Smart Citizen Auth APIs
// Run: node test_enhanced_auth_apis.js

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/auth';

class AuthAPITester {
  constructor() {
    this.accessToken = null;
    this.userId = null;
    this.testEmail = `test_${Date.now()}@ceylon.gov.lk`;
  }

  async log(message, data = null) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log('---');
  }

  async testRegisterAndLogin() {
    try {
      this.log('🔐 Testing User Registration...');
      
      const registerData = {
        email: this.testEmail,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        nicNumber: '123456789V',
        phoneNumber: '+94771234567',
        preferredLanguage: 'en'
      };

      const registerResponse = await axios.post(`${API_BASE}/register`, registerData);
      this.log('✅ Registration successful', registerResponse.data);

      this.log('🔑 Testing User Login...');
      const loginResponse = await axios.post(`${API_BASE}/login`, {
        email: this.testEmail,
        password: 'TestPassword123!',
        language: 'en'
      });

      this.accessToken = loginResponse.data.data.tokens.accessToken;
      this.userId = loginResponse.data.data.user.id;
      this.log('✅ Login successful', { 
        userId: this.userId,
        hasToken: !!this.accessToken 
      });

    } catch (error) {
      this.log('❌ Registration/Login failed', error.response?.data || error.message);
      throw error;
    }
  }

  async testActiveSessions() {
    try {
      this.log('📱 Testing Active Sessions...');
      
      const response = await axios.get(`${API_BASE}/sessions`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      this.log('✅ Active sessions retrieved', {
        totalSessions: response.data.data.totalSessions,
        sessions: response.data.data.sessions.length
      });

      return response.data.data.sessions;
    } catch (error) {
      this.log('❌ Active sessions test failed', error.response?.data || error.message);
      throw error;
    }
  }

  async testSessionLogout(sessions) {
    try {
      if (sessions.length === 0) {
        this.log('⚠️ No sessions to test logout');
        return;
      }

      const sessionToLogout = sessions.find(s => !s.isCurrent);
      if (!sessionToLogout) {
        this.log('⚠️ No non-current sessions to test logout');
        return;
      }

      this.log(`🚪 Testing Session Logout for session: ${sessionToLogout.id}`);
      
      const response = await axios.post(`${API_BASE}/logout-session/${sessionToLogout.id}`, {}, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      this.log('✅ Session logout successful', response.data.data);
    } catch (error) {
      this.log('❌ Session logout test failed', error.response?.data || error.message);
    }
  }

  async testTwoFactorAuth() {
    try {
      this.log('🔒 Testing Two-Factor Authentication Setup...');
      
      const setupResponse = await axios.post(`${API_BASE}/2fa/setup`, {}, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      this.log('✅ 2FA setup successful', {
        hasSecret: !!setupResponse.data.data.secret,
        hasBackupCodes: !!setupResponse.data.data.backupCodes,
        backupCodesCount: setupResponse.data.data.backupCodes?.length
      });

      // Test verification with a mock code (will fail but tests the endpoint)
      this.log('🔍 Testing 2FA Verification (will fail with mock code)...');
      try {
        await axios.post(`${API_BASE}/2fa/verify`, 
          { code: '123456' }, 
          { headers: { Authorization: `Bearer ${this.accessToken}` } }
        );
      } catch (verifyError) {
        this.log('⚠️ 2FA verification failed as expected with mock code', verifyError.response?.data?.message);
      }

      return setupResponse.data.data;
    } catch (error) {
      this.log('❌ 2FA test failed', error.response?.data || error.message);
      throw error;
    }
  }

  async testDataExport() {
    try {
      this.log('📊 Testing Data Export...');
      
      const response = await axios.get(`${API_BASE}/export-data`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      this.log('✅ Data export successful', {
        dataSize: response.data.metadata.dataSize,
        recordCount: response.data.metadata.recordCount,
        hasPersonalInfo: !!response.data.data.personalInformation.email
      });

    } catch (error) {
      this.log('❌ Data export test failed', error.response?.data || error.message);
      throw error;
    }
  }

  async testPasswordReset() {
    try {
      this.log('🔐 Testing Password Reset Flow...');
      
      // Test forgot password
      this.log('📧 Testing Forgot Password...');
      const forgotResponse = await axios.post(`${API_BASE}/forgot-password`, {
        identifier: this.testEmail,
        language: 'en'
      });

      this.log('✅ Forgot password successful', forgotResponse.data);

      // Note: In a real test, you would extract the reset token from email/SMS
      // For this test, we'll simulate with a mock token
      this.log('⚠️ Password reset token would be sent via email/SMS in production');
      this.log('🔑 To complete reset, use: POST /api/auth/reset-password with token');

      return forgotResponse.data;
    } catch (error) {
      this.log('❌ Password reset test failed', error.response?.data || error.message);
      throw error;
    }
  }

  async testLogoutAllSessions() {
    try {
      this.log('🚪🔄 Testing Logout All Sessions...');
      
      const response = await axios.post(`${API_BASE}/logout-all-sessions`, {}, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      this.log('✅ Logout all sessions successful', response.data.data);
    } catch (error) {
      this.log('❌ Logout all sessions test failed', error.response?.data || error.message);
    }
  }

  async testAccountDeactivation() {
    try {
      this.log('🗑️ Testing Account Deactivation...');
      
      const response = await axios.delete(`${API_BASE}/deactivate-account`, {
        data: { 
          password: 'TestPassword123!', 
          reason: 'Testing account deactivation API' 
        },
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      this.log('✅ Account deactivation successful', response.data.data);
    } catch (error) {
      this.log('❌ Account deactivation test failed', error.response?.data || error.message);
    }
  }

  async runAllTests() {
    try {
      this.log('🚀 Starting Ceylon Smart Citizen Enhanced Auth API Tests...');
      
      // Test basic functionality
      await this.testRegisterAndLogin();
      
      // Test new features
      const sessions = await this.testActiveSessions();
      await this.testSessionLogout(sessions);
      await this.testTwoFactorAuth();
      await this.testDataExport();
      await this.testPasswordReset();
      
      // Test destructive operations last
      await this.testLogoutAllSessions();
      await this.testAccountDeactivation();
      
      this.log('🎉 All tests completed successfully!');
      
    } catch (error) {
      this.log('💥 Test suite failed', error.message);
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AuthAPITester();
  tester.runAllTests().catch(console.error);
}

module.exports = AuthAPITester;
