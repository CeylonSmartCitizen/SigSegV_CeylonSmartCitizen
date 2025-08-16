# Ceylon Smart Citizen API Gateway - Frontend Integration Guide

## 📋 Table of Contents
- [🚀 Getting Started](#-getting-started)
- [🔐 Authentication](#-authentication)
- [🏥 System Endpoints](#-system-endpoints)
- [👤 User Authentication Endpoints](#-user-authentication-endpoints)
- [📄 Support Services](#-support-services)
- [📅 Appointment Services](#-appointment-services)
- [❌ Error Handling](#-error-handling)
- [💡 Best Practices](#-best-practices)

---

## 🚀 Getting Started

### Base URL
```
Development: http://localhost:3000
```

### Required Headers
```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer <your-jwt-token>' // For protected endpoints
}
```

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. There are two types of endpoints:

- **🟢 Public Endpoints**: No authentication required
- **🔒 Protected Endpoints**: Require valid JWT token in Authorization header

### Authentication Flow
1. Register a new user or login with existing credentials
2. Store the received `accessToken` securely (localStorage/sessionStorage)
3. Include the token in the `Authorization` header for protected endpoints
4. Refresh the token when it expires using the `refreshToken`

---

## 🏥 System Endpoints

### Health Check
**🟢 PUBLIC**
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-16T14:05:26.634Z",
  "service": "Ceylon Smart Citizen API Gateway"
}
```

### API Test
**🟢 PUBLIC**
```
GET /api/test
```

**Response:**
```json
{
  "message": "Ceylon Smart Citizen API is working!"
}
```

---

## 👤 User Authentication Endpoints

All authentication endpoints are prefixed with `/api/auth`

### 1. User Registration
**🟢 PUBLIC**
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "nicNumber": "123456789V",
  "phone": "+94771234567",
  "dateOfBirth": "1990-05-15",
  "address": "123 Main Street, Colombo"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "citizen"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 86400
    }
  }
}
```

### 2. User Login
**🟢 PUBLIC**
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "citizen"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 86400
    }
  }
}
```

### 3. Refresh Token
**🟢 PUBLIC**
```
POST /api/auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  }
}
```

### 4. Get User Profile
**🔒 PROTECTED**
```
GET /api/auth/profile
Authorization: Bearer <access-token>
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "nicNumber": "123456789V",
      "phone": "+94771234567",
      "role": "citizen",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

### 5. Update User Profile
**🔒 PROTECTED**
```
PUT /api/auth/profile
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+94771234567",
  "address": "456 New Street, Colombo"
}
```

### 6. Change Password
**🔒 PROTECTED**
```
PUT /api/auth/change-password
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### 7. User Preferences
**🔒 PROTECTED**

**Get Preferences:**
```
GET /api/auth/preferences
Authorization: Bearer <access-token>
```

**Update Preferences:**
```
PUT /api/auth/preferences
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "language": "en",
  "notifications": {
    "email": true,
    "sms": false,
    "push": true
  },
  "timezone": "Asia/Colombo"
}
```

### 8. Logout
**🔒 PROTECTED**
```
POST /api/auth/logout
Authorization: Bearer <access-token>
```

### 9. Global Logout (All Sessions)
**🔒 PROTECTED**
```
POST /api/auth/global-logout
Authorization: Bearer <access-token>
```

### 10. Password Reset
**🟢 PUBLIC**

**Request Reset:**
```
POST /api/auth/forgot-password
```
```json
{
  "email": "user@example.com"
}
```

**Reset Password:**
```
POST /api/auth/reset-password
```
```json
{
  "token": "reset-token-from-email",
  "password": "NewPassword123!"
}
```

---

## 📄 Support Services

All support service endpoints require authentication and are prefixed with `/api/support`

### 📢 Notifications

#### Get All Notifications
**🔒 PROTECTED**
```
GET /api/support/notifications/
Authorization: Bearer <access-token>
```

#### Get User Notifications
**🔒 PROTECTED**
```
GET /api/support/notifications/user/:userId
Authorization: Bearer <access-token>
```

#### Get Specific Notification
**🔒 PROTECTED**
```
GET /api/support/notifications/:id
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "id": 1,
  "userId": "testuser2",
  "message": "Your appointment has been confirmed",
  "type": "info",
  "title": "Appointment Confirmation",
  "isRead": false,
  "createdAt": "2025-08-16T13:35:42.273Z",
  "updatedAt": "2025-08-16T13:35:42.273Z",
  "readAt": null
}
```

#### Create Notification
**🔒 PROTECTED**
```
POST /api/support/notifications/
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "userId": "user-id",
  "title": "New Notification",
  "message": "This is a notification message",
  "type": "info"
}
```

#### Mark Notification as Read
**🔒 PROTECTED**
```
PATCH /api/support/notifications/:id/read
Authorization: Bearer <access-token>
```

#### Mark All User Notifications as Read
**🔒 PROTECTED**
```
PATCH /api/support/notifications/user/:userId/read-all
Authorization: Bearer <access-token>
```

#### Delete Notification
**🔒 PROTECTED**
```
DELETE /api/support/notifications/:id
Authorization: Bearer <access-token>
```

### 🏢 Officers

#### Get Officers Information
**🔒 PROTECTED**
```
GET /api/support/officers/
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "message": "Officer Management API is working",
  "endpoints": [
    "/officers",
    "/officers/:officerId", 
    "/sessions/:sessionId/officer-status"
  ],
  "version": "1.0.0"
}
```

#### Get All Officers
**🔒 PROTECTED**
```
GET /api/support/officers/officers
Authorization: Bearer <access-token>
```

#### Get Specific Officer
**🔒 PROTECTED**
```
GET /api/support/officers/officers/:officerId
Authorization: Bearer <access-token>
```

#### Get Officer Status for Session
**🔒 PROTECTED**
```
GET /api/support/officers/sessions/:sessionId/officer-status
Authorization: Bearer <access-token>
```

#### Create Officer
**🔒 PROTECTED**
```
POST /api/support/officers/officers
Authorization: Bearer <access-token>
```

### 📋 Queue Management

#### Get Queue Information
**🔒 PROTECTED**
```
GET /api/support/queues/
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "message": "Queue Management API is working",
  "endpoints": [
    "/queues",
    "/sessions", 
    "/queues/:queueId/jobs",
    "/sessions/:sessionId"
  ],
  "version": "1.0.0"
}
```

#### Get All Queues
**🔒 PROTECTED**
```
GET /api/support/queues/queues
Authorization: Bearer <access-token>
```

#### Get Queue Jobs
**🔒 PROTECTED**
```
GET /api/support/queues/queues/:queueId/jobs
Authorization: Bearer <access-token>
```

#### Add Job to Queue
**🔒 PROTECTED**
```
POST /api/support/queues/queues/:queueId/jobs
Authorization: Bearer <access-token>
```

#### Get Sessions
**🔒 PROTECTED**
```
GET /api/support/queues/sessions
Authorization: Bearer <access-token>
```

#### Get Specific Session
**🔒 PROTECTED**
```
GET /api/support/queues/sessions/:sessionId
Authorization: Bearer <access-token>
```

#### Create Session
**🔒 PROTECTED**
```
POST /api/support/queues/sessions
Authorization: Bearer <access-token>
```

### 📁 Document Management

#### Get Documents List
**🔒 PROTECTED**
```
GET /api/support/documents/list
Authorization: Bearer <access-token>
```

#### Get Document
**🔒 PROTECTED**
```
GET /api/support/documents/:id
Authorization: Bearer <access-token>
```

#### Get Document Status
**🔒 PROTECTED**
```
GET /api/support/documents/:id/status
Authorization: Bearer <access-token>
```

#### Upload Document
**🔒 PROTECTED**
```
POST /api/support/documents/upload
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

#### Delete Document
**🔒 PROTECTED**
```
DELETE /api/support/documents/:id
Authorization: Bearer <access-token>
```

### 📊 Audit Logs

#### Get Audit Information
**🔒 PROTECTED**
```
GET /api/support/audit/
Authorization: Bearer <access-token>
```

#### Get All Audit Logs
**🔒 PROTECTED**
```
GET /api/support/audit/audit-logs
Authorization: Bearer <access-token>
```

#### Get Specific Audit Log
**🔒 PROTECTED**
```
GET /api/support/audit/audit-logs/:id
Authorization: Bearer <access-token>
```

#### Get User Audit Logs
**🔒 PROTECTED**
```
GET /api/support/audit/audit-logs/user/:userId
Authorization: Bearer <access-token>
```

---

## 📅 Appointment Services

All appointment endpoints require authentication and are prefixed with `/api/appointments`

### 📋 Appointments

#### Get Appointments
**🔒 PROTECTED**
```
GET /api/appointments/appointments
Authorization: Bearer <access-token>
```

#### Get Specific Appointment
**🔒 PROTECTED**
```
GET /api/appointments/appointments/:id
Authorization: Bearer <access-token>
```

#### Create Appointment
**🔒 PROTECTED**
```
POST /api/appointments/appointments
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "serviceId": "service-id",
  "departmentId": "department-id",
  "citizenId": "citizen-id",
  "appointmentDate": "2025-08-20",
  "appointmentTime": "10:00",
  "description": "Appointment description"
}
```

#### Update Appointment
**🔒 PROTECTED**
```
PUT /api/appointments/appointments/:id
Authorization: Bearer <access-token>
```

#### Cancel Appointment
**🔒 PROTECTED**
```
DELETE /api/appointments/appointments/:id
Authorization: Bearer <access-token>
```

### 🏛️ Departments

#### Get All Departments
**🔒 PROTECTED**
```
GET /api/appointments/departments
Authorization: Bearer <access-token>
```

#### Get Specific Department
**🔒 PROTECTED**
```
GET /api/appointments/departments/:id
Authorization: Bearer <access-token>
```

### 👮 Officers

#### Get All Officers
**🔒 PROTECTED**
```
GET /api/appointments/officers
Authorization: Bearer <access-token>
```

#### Get Specific Officer
**🔒 PROTECTED**
```
GET /api/appointments/officers/:id
Authorization: Bearer <access-token>
```

### 🔄 Queue

#### Get Queue Status
**🔒 PROTECTED**
```
GET /api/appointments/queue
Authorization: Bearer <access-token>
```

#### Join Queue
**🔒 PROTECTED**
```
POST /api/appointments/queue
Authorization: Bearer <access-token>
```

### 🛠️ Services

#### Get All Services
**🔒 PROTECTED**
```
GET /api/appointments/services
Authorization: Bearer <access-token>
```

#### Get Specific Service
**🔒 PROTECTED**
```
GET /api/appointments/services/:id
Authorization: Bearer <access-token>
```

---

## ❌ Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "field": "fieldName" // Optional, for validation errors
}
```

### Common HTTP Status Codes

| Status Code | Description | When it occurs |
|-------------|-------------|----------------|
| `200` | OK | Successful request |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Authentication required or invalid token |
| `403` | Forbidden | Access denied |
| `404` | Not Found | Resource not found |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

### Authentication Errors

**No Token Provided:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Token Expired:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Validation Errors

**Example Registration Error:**
```json
{
  "success": false,
  "message": "This email is already registered",
  "code": "DUPLICATE_EMAIL",
  "field": "email"
}
```

---

## 💡 Best Practices

### 1. Token Management
```javascript
// Store tokens securely
localStorage.setItem('accessToken', data.tokens.accessToken);
localStorage.setItem('refreshToken', data.tokens.refreshToken);

// Include token in requests
const token = localStorage.getItem('accessToken');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 2. Error Handling
```javascript
try {
  const response = await fetch('/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
```

### 3. Token Refresh
```javascript
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  try {
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data.accessToken;
    }
  } catch (error) {
    // Redirect to login
    window.location.href = '/login';
  }
}
```

### 4. Automatic Token Refresh
```javascript
// Axios interceptor example
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        error.config.headers['Authorization'] = `Bearer ${newToken}`;
        return axios.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

### 5. Loading States
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const data = await apiCall();
    // Handle success
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 6. Rate Limiting
```javascript
// Handle rate limiting gracefully
if (error.status === 429) {
  const retryAfter = error.headers['retry-after'] || 60;
  setTimeout(() => {
    // Retry request
  }, retryAfter * 1000);
}
```

---

## 📞 Support

For additional support or questions about the API:
- **Development Team**: [dev-team@ceylonsmartcitizen.lk]
- **Documentation**: Check this guide and inline code comments
- **Issues**: Report bugs through the project's issue tracker

---

**Last Updated**: August 16, 2025
**Version**: 1.0.0
**API Gateway**: Ceylon Smart Citizen Platform
