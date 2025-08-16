# Ceylon Smart Citizen API - Quick Reference

## 🚀 Base URL
```
Development: http://localhost:3000
Production: https://api.ceylonsmartcitizen.lk
```

## 🔐 Authentication
```javascript
// Headers for protected endpoints
{
  'Authorization': 'Bearer <access-token>',
  'Content-Type': 'application/json'
}
```

## 📋 Endpoint Summary

### 🏥 System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | 🟢 | Health check |
| `GET` | `/api/test` | 🟢 | API test |

### 👤 Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | 🟢 | Register user |
| `POST` | `/login` | 🟢 | Login user |
| `POST` | `/refresh-token` | 🟢 | Refresh access token |
| `POST` | `/forgot-password` | 🟢 | Request password reset |
| `POST` | `/reset-password` | 🟢 | Reset password |
| `GET` | `/profile` | 🔒 | Get user profile |
| `PUT` | `/profile` | 🔒 | Update user profile |
| `PUT` | `/change-password` | 🔒 | Change password |
| `GET` | `/preferences` | 🔒 | Get user preferences |
| `PUT` | `/preferences` | 🔒 | Update preferences |
| `POST` | `/logout` | 🔒 | Logout current session |
| `POST` | `/global-logout` | 🔒 | Logout all sessions |

### 📢 Notifications (`/api/support/notifications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | 🔒 | Get all notifications |
| `GET` | `/user/:userId` | 🔒 | Get user notifications |
| `GET` | `/:id` | 🔒 | Get specific notification |
| `POST` | `/` | 🔒 | Create notification |
| `PATCH` | `/:id/read` | 🔒 | Mark as read |
| `PATCH` | `/user/:userId/read-all` | 🔒 | Mark all as read |
| `DELETE` | `/:id` | 🔒 | Delete notification |

### 🏢 Officers (`/api/support/officers`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | 🔒 | Get API info |
| `GET` | `/officers` | 🔒 | Get all officers |
| `GET` | `/officers/:id` | 🔒 | Get specific officer |
| `GET` | `/sessions/:id/officer-status` | 🔒 | Get officer status |
| `POST` | `/officers` | 🔒 | Create officer |

### 📋 Queue Management (`/api/support/queues`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | 🔒 | Get API info |
| `GET` | `/queues` | 🔒 | Get all queues |
| `GET` | `/queues/:id/jobs` | 🔒 | Get queue jobs |
| `POST` | `/queues/:id/jobs` | 🔒 | Add job to queue |
| `GET` | `/sessions` | 🔒 | Get all sessions |
| `GET` | `/sessions/:id` | 🔒 | Get specific session |
| `POST` | `/sessions` | 🔒 | Create session |

### 📁 Documents (`/api/support/documents`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/list` | 🔒 | Get documents list |
| `GET` | `/:id` | 🔒 | Get document |
| `GET` | `/:id/status` | 🔒 | Get document status |
| `POST` | `/upload` | 🔒 | Upload document |
| `DELETE` | `/:id` | 🔒 | Delete document |

### 📊 Audit Logs (`/api/support/audit`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | 🔒 | Get API info |
| `GET` | `/audit-logs` | 🔒 | Get all audit logs |
| `GET` | `/audit-logs/:id` | 🔒 | Get specific log |
| `GET` | `/audit-logs/user/:userId` | 🔒 | Get user logs |

### 📅 Appointments (`/api/appointments`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/appointments` | 🔒 | Get appointments |
| `GET` | `/appointments/:id` | 🔒 | Get specific appointment |
| `POST` | `/appointments` | 🔒 | Create appointment |
| `PUT` | `/appointments/:id` | 🔒 | Update appointment |
| `DELETE` | `/appointments/:id` | 🔒 | Cancel appointment |
| `GET` | `/departments` | 🔒 | Get departments |
| `GET` | `/departments/:id` | 🔒 | Get specific department |
| `GET` | `/officers` | 🔒 | Get officers |
| `GET` | `/officers/:id` | 🔒 | Get specific officer |
| `GET` | `/queue` | 🔒 | Get queue status |
| `POST` | `/queue` | 🔒 | Join queue |
| `GET` | `/services` | 🔒 | Get services |
| `GET` | `/services/:id` | 🔒 | Get specific service |

## 🔑 Legend
- 🟢 **Public**: No authentication required
- 🔒 **Protected**: Requires JWT token in Authorization header

## ⚡ Quick Examples

### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const data = await response.json();
const token = data.data.tokens.accessToken;
```

### Get Notifications
```javascript
const response = await fetch('/api/support/notifications/', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const notifications = await response.json();
```

### Create Appointment
```javascript
const response = await fetch('/api/appointments/appointments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    serviceId: 'service-id',
    departmentId: 'dept-id',
    appointmentDate: '2025-08-20',
    appointmentTime: '10:00'
  })
});
```

## 🚨 Error Handling
```javascript
try {
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return await response.json();
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
```
