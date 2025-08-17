# Ceylon Smart Citizen API Gateway - Complete API Reference

## 📋 Table of Contents
- [🚀 Getting Started](#-getting-started)
- [🔐 Authentication](#-authentication)
- [👤 Authentication Service](#-authentication-service)
- [📅 Appointment Service](#-appointment-service)
- [🛠️ Support Services](#-support-services)
- [❌ Error Handling](#-error-handling)
- [📊 Response Formats](#-response-formats)

---

## 🚀 Getting Started

### Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

### Architecture Overview
The Ceylon Smart Citizen API Gateway provides access to multiple microservices:

- **🔐 Authentication Service** (`/api/auth/*`) - User authentication and profile management
- **📅 Appointment Service** (`/api/appointments/*`) - Government appointment booking system
- **🛠️ Support Services** (`/api/support/*`) - Notifications, queues, officers, documents, audit

### Required Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <your-jwt-token>  # For protected endpoints
```

### System Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-16T16:30:00.000Z",
  "service": "Ceylon Smart Citizen API Gateway"
}
```

### API Test Endpoint
```http
GET /api/test
```

**Response:**
```json
{
  "message": "Ceylon Smart Citizen API is working!"
}
```

---

## 🔐 Authentication

### Authentication Types
- **🟢 Public Endpoints**: No authentication required (registration, login, health checks)
- **🔒 Protected Endpoints**: Require valid JWT token in Authorization header

### Token Management
- **Access Token**: Valid for 24 hours, used for API access
- **Refresh Token**: Valid for 7 days, used to get new access tokens

---

## 👤 Authentication Service

Base Path: `/api/auth`

### Service Health
```http
GET /api/auth/health
```

**Response:**
```json
{
  "success": true,
  "message": "Ceylon Auth Service is healthy",
  "timestamp": "2025-08-16T16:30:00.000Z",
  "version": "1.0.0",
  "features": [
    "JWT Authentication",
    "NIC Validation",
    "Rate Limiting",
    "Token Blacklisting",
    "Session Management",
    "Multi-language Support"
  ]
}
```

### User Registration
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phone": "0771234567",
  "nicNumber": "199512345678",
  "address": "123 Main Street, Colombo",
  "dateOfBirth": "1995-01-01",
  "gender": "Male",
  "preferredLanguage": "en",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "0777654321",
    "relationship": "Sister"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "83744ad5-abe1-4460-9b5e-d6032324bf6d",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "nicNumber": "199512345678",
      "role": "citizen"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "tokenType": "Bearer",
      "expiresIn": 86400
    }
  }
}
```

### User Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "83744ad5-abe1-4460-9b5e-d6032324bf6d",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "citizen"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "tokenType": "Bearer",
      "expiresIn": 86400
    }
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "tokenType": "Bearer",
      "expiresIn": 86400
    }
  }
}
```

### Get User Profile 🔒
```http
GET /api/auth/profile
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "83744ad5-abe1-4460-9b5e-d6032324bf6d",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "nicNumber": "199512345678",
      "phone": "0771234567",
      "address": "123 Main Street, Colombo",
      "dateOfBirth": "1995-01-01",
      "gender": "Male",
      "role": "citizen",
      "isActive": true,
      "createdAt": "2025-08-16T10:00:00.000Z",
      "updatedAt": "2025-08-16T10:00:00.000Z"
    }
  }
}
```

### Update User Profile 🔒
```http
PUT /api/auth/profile
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "0771234568",
  "address": "456 New Street, Colombo"
}
```

### Get User Preferences 🔒
```http
GET /api/auth/preferences
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Preferences retrieved successfully",
  "data": {
    "preferences": {
      "language": "en",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      },
      "theme": "light",
      "timezone": "Asia/Colombo"
    }
  }
}
```

### Update User Preferences 🔒
```http
PUT /api/auth/preferences
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "language": "si",
  "notifications": {
    "email": true,
    "sms": true,
    "push": false
  },
  "theme": "dark"
}
```

### Change Password 🔒
```http
PUT /api/auth/change-password
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

### Logout 🔒
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Global Logout 🔒
```http
POST /api/auth/global-logout
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Global logout successful"
}
```

---

## 📅 Appointment Service

Base Path: `/api/appointments`
**Note**: All appointment endpoints require authentication 🔒

### Service Health 🔒
```http
GET /api/appointments/health
Authorization: Bearer <access-token>
```

### Departments

#### List Departments 🔒
```http
GET /api/appointments/departments
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": {
    "departments": [
      {
        "id": "dept-001",
        "name": "Immigration Department",
        "nameEn": "Immigration Department",
        "nameSi": "සංක්‍රමණ දෙපාර්තමේන්තුව",
        "nameTa": "குடியேற்ற துறை",
        "description": "Passport and visa services",
        "isActive": true
      }
    ]
  }
}
```

#### Create Department 🔒
```http
POST /api/appointments/departments
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "Department Name",
  "nameEn": "Department Name",
  "nameSi": "දෙපාර්තමේන්තු නාමය",
  "nameTa": "துறை பெயர்",
  "description": "Department description"
}
```

### Services

#### List Services 🔒
```http
GET /api/appointments/services
Authorization: Bearer <access-token>
```

#### List Services by Department 🔒
```http
GET /api/appointments/services/department/{departmentId}
Authorization: Bearer <access-token>
```

#### Create Service 🔒
```http
POST /api/appointments/services
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "departmentId": "dept-001",
  "name": "Passport Application",
  "nameEn": "Passport Application",
  "nameSi": "පාස්පෝට් අයදුම්පත",
  "nameTa": "கடவுச்சீட்டு விண்ணப்பம்",
  "description": "New passport application service",
  "duration": 30,
  "fee": 1500.00
}
```

### Officers

#### List Officers 🔒
```http
GET /api/appointments/officers
Authorization: Bearer <access-token>
```

#### List Officers by Department 🔒
```http
GET /api/appointments/officers/department/{departmentId}
Authorization: Bearer <access-token>
```

### Appointments

#### List User Appointments 🔒
```http
GET /api/appointments
Authorization: Bearer <access-token>
```

#### Get Appointment Details 🔒
```http
GET /api/appointments/{appointmentId}
Authorization: Bearer <access-token>
```

#### Create Appointment 🔒
```http
POST /api/appointments
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "departmentId": "dept-001",
  "serviceId": "service-001",
  "officerId": "officer-001",
  "appointmentDate": "2025-08-20",
  "appointmentTime": "10:00",
  "notes": "First-time passport application"
}
```

#### Update Appointment 🔒
```http
PUT /api/appointments/{appointmentId}
Authorization: Bearer <access-token>
```

#### Cancel Appointment 🔒
```http
DELETE /api/appointments/{appointmentId}
Authorization: Bearer <access-token>
```

### Queue Management

#### Get Queue Status 🔒
```http
GET /api/appointments/queue
Authorization: Bearer <access-token>
```

#### Join Queue 🔒
```http
POST /api/appointments/queue
Authorization: Bearer <access-token>
```

#### Leave Queue 🔒
```http
DELETE /api/appointments/queue/{queueId}
Authorization: Bearer <access-token>
```

---

## 🛠️ Support Services

Base Path: `/api/support`
**Note**: All support endpoints require authentication 🔒

### Notifications

#### List User Notifications 🔒
```http
GET /api/support/notifications
Authorization: Bearer <access-token>
```

#### Mark Notification as Read 🔒
```http
PUT /api/support/notifications/{notificationId}/read
Authorization: Bearer <access-token>
```

#### Delete Notification 🔒
```http
DELETE /api/support/notifications/{notificationId}
Authorization: Bearer <access-token>
```

### Documents

#### List User Documents 🔒
```http
GET /api/support/documents
Authorization: Bearer <access-token>
```

#### Upload Document 🔒
```http
POST /api/support/documents
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

#### Download Document 🔒
```http
GET /api/support/documents/{documentId}
Authorization: Bearer <access-token>
```

#### Delete Document 🔒
```http
DELETE /api/support/documents/{documentId}
Authorization: Bearer <access-token>
```

### Officers

#### List Available Officers 🔒
```http
GET /api/support/officers
Authorization: Bearer <access-token>
```

#### Get Officer Details 🔒
```http
GET /api/support/officers/{officerId}
Authorization: Bearer <access-token>
```

### Queues

#### List Active Queues 🔒
```http
GET /api/support/queues
Authorization: Bearer <access-token>
```

#### Get Queue Details 🔒
```http
GET /api/support/queues/{queueId}
Authorization: Bearer <access-token>
```

### Audit

#### List User Activity 🔒
```http
GET /api/support/audit
Authorization: Bearer <access-token>
```

#### Get Activity Details 🔒
```http
GET /api/support/audit/{activityId}
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
  "errors": {
    "field": "Field-specific error message"
  }
}
```

### Common HTTP Status Codes

| Status Code | Description | When It Occurs |
|-------------|-------------|----------------|
| `200` | Success | Request completed successfully |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request data or validation failed |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Requested resource doesn't exist |
| `409` | Conflict | Resource already exists (e.g., duplicate email) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error occurred |

### Common Error Codes

#### Authentication Errors
- `TOKEN_REQUIRED` - No authorization header provided
- `INVALID_TOKEN` - Malformed or invalid JWT token
- `TOKEN_EXPIRED` - JWT token has expired
- `TOKEN_BLACKLISTED` - Token has been invalidated
- `USER_NOT_FOUND` - User account doesn't exist
- `INVALID_CREDENTIALS` - Wrong email/password combination

#### Validation Errors
- `VALIDATION_ERROR` - Request data validation failed
- `DUPLICATE_EMAIL` - Email address already registered
- `DUPLICATE_NIC` - NIC number already registered
- `WEAK_PASSWORD` - Password doesn't meet security requirements
- `INVALID_NIC` - NIC number format is invalid

#### Rate Limiting Errors
- `TOO_MANY_REQUESTS` - General rate limit exceeded
- `TOO_MANY_REGISTRATIONS` - Registration attempts exceeded
- `TOO_MANY_LOGIN_ATTEMPTS` - Login attempts exceeded

### Example Error Responses

#### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

#### Authentication Error
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "code": "TOKEN_EXPIRED"
}
```

#### Rate Limit Error
```json
{
  "success": false,
  "message": "Too many login attempts, please try again later",
  "code": "TOO_MANY_REQUESTS"
}
```

---

## 📊 Response Formats

### Success Response Structure
```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Response data object
  },
  "meta": {
    // Optional metadata (pagination, etc.)
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Pagination
For endpoints that return lists, pagination is handled via query parameters:

```http
GET /api/endpoint?page=1&limit=20&sort=createdAt&order=desc
```

**Pagination Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Date/Time Format
All timestamps are in ISO 8601 format (UTC):
```
2025-08-16T16:30:00.000Z
```

### Multilingual Content
Content supports three languages:
- `en` - English
- `si` - Sinhala  
- `ta` - Tamil

Objects with multilingual content include language-specific fields:
```json
{
  "name": "Default name",
  "nameEn": "English name",
  "nameSi": "සිංහල නම",
  "nameTa": "தமிழ் பெயர்"
}
```

---

**API Gateway Version**: 1.0.0  
**Last Updated**: August 16, 2025  
**Status**: ✅ All endpoints tested and functional
