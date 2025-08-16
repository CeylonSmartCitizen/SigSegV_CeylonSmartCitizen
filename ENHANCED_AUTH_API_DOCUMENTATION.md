# Ceylon Smart Citizen - Enhanced Authentication API Documentation

## 🚀 New API Endpoints Implementation

This document outlines the newly implemented API endpoints for enhanced authentication features in the Ceylon Smart Citizen platform.

## 📍 Base URL
```
http://localhost:3001/api/auth
```

## 🔐 Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🆕 New API Endpoints

### 1. Active Session Management

#### Get Active Sessions
```http
GET /api/auth/sessions
```

**Description**: Retrieve all active sessions for the authenticated user.

**Headers**: 
- `Authorization: Bearer <token>` (Required)

**Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "deviceInfo": "Mozilla/5.0...",
        "ipAddress": "192.168.1.1",
        "createdAt": "2025-08-16T10:00:00Z",
        "lastActive": "2025-08-16T11:30:00Z",
        "expiresAt": "2025-08-17T10:00:00Z",
        "isCurrent": true
      }
    ],
    "totalSessions": 1
  },
  "message": "Active sessions retrieved successfully"
}
```

#### Logout Specific Session
```http
POST /api/auth/logout-session/:sessionId
```

**Description**: Logout a specific session by ID.

**Parameters**:
- `sessionId` (URL parameter): UUID of the session to logout

**Headers**: 
- `Authorization: Bearer <token>` (Required)

**Response**:
```json
{
  "success": true,
  "message": "Session logged out successfully",
  "data": {
    "sessionId": "uuid",
    "loggedOutAt": "2025-08-16T12:00:00Z"
  }
}
```

#### Logout All Sessions
```http
POST /api/auth/logout-all-sessions
```

**Description**: Logout all active sessions for the authenticated user.

**Headers**: 
- `Authorization: Bearer <token>` (Required)

**Response**:
```json
{
  "success": true,
  "message": "All sessions logged out successfully",
  "data": {
    "loggedOutSessions": 3,
    "timestamp": "2025-08-16T12:00:00Z"
  }
}
```

---

### 2. Account Management

#### Deactivate Account
```http
DELETE /api/auth/deactivate-account
```

**Description**: Deactivate the user's account permanently.

**Headers**: 
- `Authorization: Bearer <token>` (Required)

**Body**:
```json
{
  "password": "user_password",
  "reason": "Optional reason for deactivation"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Account deactivation request submitted and processed",
  "data": {
    "requestId": "uuid",
    "requestedAt": "2025-08-16T12:00:00Z",
    "status": "Account deactivated successfully"
  }
}
```

---

### 3. Data Export (GDPR Compliance)

#### Export User Data
```http
GET /api/auth/export-data
```

**Description**: Export all user data for GDPR compliance.

**Headers**: 
- `Authorization: Bearer <token>` (Required)

**Response**:
```json
{
  "success": true,
  "message": "User data exported successfully",
  "data": {
    "metadata": {
      "exportedAt": "2025-08-16T12:00:00Z",
      "userId": "uuid",
      "exportVersion": "1.0",
      "format": "JSON"
    },
    "personalInformation": {
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "nic_number": "12****89V",
      "phone_number": "077****67"
    },
    "appointments": [],
    "sessions": [],
    "preferences": {},
    "securitySettings": {}
  },
  "metadata": {
    "exportedAt": "2025-08-16T12:00:00Z",
    "dataSize": 2048,
    "recordCount": {
      "appointments": 0,
      "sessions": 1,
      "totalRecords": 1
    }
  }
}
```

---

### 4. Two-Factor Authentication

#### Setup Two-Factor Authentication
```http
POST /api/auth/2fa/setup
```

**Description**: Initialize two-factor authentication for the user.

**Headers**: 
- `Authorization: Bearer <token>` (Required)

**Response**:
```json
{
  "success": true,
  "message": "Two-factor authentication setup initiated. Please verify with your authenticator app.",
  "data": {
    "secret": "secret_key_for_authenticator",
    "qrCodeData": "ceylon-smart-citizen:userid?secret=...",
    "backupCodes": [
      "A1B2C3D4",
      "E5F6G7H8",
      "..."
    ]
  }
}
```

#### Verify Two-Factor Authentication
```http
POST /api/auth/2fa/verify
```

**Description**: Verify and enable two-factor authentication with a code from authenticator app.

**Headers**: 
- `Authorization: Bearer <token>` (Required)

**Body**:
```json
{
  "code": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Two-factor authentication enabled successfully",
  "data": {
    "timestamp": "2025-08-16T12:00:00Z"
  }
}
```

#### Disable Two-Factor Authentication
```http
POST /api/auth/2fa/disable
```

**Description**: Disable two-factor authentication for the user.

**Headers**: 
- `Authorization: Bearer <token>` (Required)

**Body**:
```json
{
  "password": "user_password"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Two-factor authentication disabled successfully",
  "data": {
    "timestamp": "2025-08-16T12:00:00Z"
  }
}
```

---

### 5. Password Reset/Recovery

#### Forgot Password
```http
POST /api/auth/forgot-password
```

**Description**: Request password reset for a user account. Can use email, phone number, or NIC.

**Body**:
```json
{
  "identifier": "user@example.com",
  "language": "en"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset instructions have been sent",
  "code": "RESET_INSTRUCTIONS_SENT"
}
```

**Note**: For security reasons, this endpoint always returns success, regardless of whether the user exists.

#### Reset Password
```http
POST /api/auth/reset-password
```

**Description**: Reset password using the token received from forgot password request.

**Body**:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!",
  "language": "en"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "timestamp": "2025-08-16T12:00:00Z",
    "loggedOutAllSessions": true
  }
}
```

**Security Features**:
- Reset tokens expire after 15 minutes
- All existing sessions are logged out after successful reset
- Password strength validation applied
- Reset attempts are logged for audit

---

## 🗄️ Database Schema Updates

The following new tables have been added to support these features:

### user_sessions
Tracks active user sessions for session management.

### user_two_factor
Stores two-factor authentication settings and backup codes.

### user_data_exports
Logs data export requests for audit purposes.

### user_deactivation_requests
Tracks account deactivation requests.

### password_reset_requests
Logs password reset requests with tokens and expiry.

### user_rate_limits (enhanced)
Enhanced rate limiting with more detailed tracking.

### users table additions
- `reset_token`: Stores password reset token
- `reset_token_expires`: Token expiration timestamp

---

## 🔧 Security Features

### Session Management
- **Token Tracking**: Each session is tracked with unique JWT ID
- **Device Information**: Stores device and IP information
- **Automatic Cleanup**: Expired sessions are automatically cleaned up
- **Blacklisting**: Logged out tokens are added to blacklist

### Two-Factor Authentication
- **TOTP Support**: Time-based one-time passwords
- **Backup Codes**: 8 single-use backup codes for recovery
- **Secure Storage**: Encrypted secret keys and hashed backup codes
- **Password Verification**: Requires password confirmation to disable

### Data Privacy
- **Data Masking**: Sensitive data is masked in exports
- **GDPR Compliance**: Complete data export functionality
- **Audit Logging**: All export requests are logged
- **Automatic Expiry**: Export data expires after 30 days

### Account Security
- **Password Verification**: Required for account deactivation
- **Immediate Logout**: All sessions terminated on deactivation
- **Audit Trail**: Deactivation requests are logged with reason

---

## 🧪 Testing

Run the test suite to verify all endpoints:

```bash
cd backend/services/auth-service
node tests/test_enhanced_auth_apis.js
```

The test suite covers:
- User registration and login
- Active session management
- Session logout (individual and all)
- Two-factor authentication setup and verification
- Data export functionality
- Account deactivation

---

## 📝 Frontend Integration

The frontend can now use these endpoints as originally requested:

```javascript
// Active Sessions
export const getActiveSessions = () => axios.get(`${API_BASE}/sessions`);
export const logoutSession = (sessionId) => axios.post(`${API_BASE}/logout-session/${sessionId}`);
export const logoutAllSessions = () => axios.post(`${API_BASE}/logout-all-sessions`);

// Account Deactivation
export const deactivateAccount = () => axios.delete(`${API_BASE}/deactivate-account`);

// Data Export
export const exportUserData = () => axios.get(`${API_BASE}/export-data`);

// Two-Factor Authentication
export const setupTwoFactor = () => axios.post(`${API_BASE}/2fa/setup`);
export const verifyTwoFactor = (code) => axios.post(`${API_BASE}/2fa/verify`, { code });
export const disableTwoFactor = () => axios.post(`${API_BASE}/2fa/disable`);
```

---

## 🚀 Production Deployment

Before deploying to production:

1. **Run Database Migration**: Execute `004_enhanced_auth_features.sql`
2. **Environment Variables**: Set up proper JWT secrets and database connections
3. **Rate Limiting**: Configure appropriate rate limits for production
4. **2FA Integration**: Consider integrating with proper TOTP libraries like `speakeasy`
5. **Monitoring**: Set up monitoring for new endpoints
6. **Documentation**: Update API documentation for client teams

---

## 📊 Health Check

The auth service health check now includes the new features:

```http
GET /api/auth/health
```

Response includes:
- JWT Authentication ✅
- NIC Validation ✅
- Rate Limiting ✅
- Token Blacklisting ✅
- Session Management ✅
- Multi-language Support ✅
- **Two-Factor Authentication ✅ (NEW)**
- **Data Export (GDPR) ✅ (NEW)**
- **Account Deactivation ✅ (NEW)**
- **Active Session Management ✅ (NEW)**
- **Password Reset/Recovery ✅ (NEW)**

All requested API endpoints have been successfully implemented and are ready for frontend integration! 🎉
