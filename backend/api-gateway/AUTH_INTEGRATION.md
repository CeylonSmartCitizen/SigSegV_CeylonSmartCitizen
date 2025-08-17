# API Gateway Auth Integration

## Overview
The API Gateway now proxies all `/api/auth/*` requests to the Auth Service. This allows clients to interact with authentication endpoints through a single gateway entry point.

## Available Endpoints (via Gateway)
- `POST   /api/auth/register` — Register a new user
- `POST   /api/auth/login` — Login and receive tokens
- `POST   /api/auth/refresh-token` — Refresh JWT tokens
- `GET    /api/auth/profile` — Get user profile (requires authentication)
- `PUT    /api/auth/profile` — Update user profile (requires authentication)
- `PUT    /api/auth/change-password` — Change password (requires authentication)
- `GET    /api/auth/preferences` — Get user preferences (requires authentication)
- `PUT    /api/auth/preferences` — Update user preferences (requires authentication)
- `POST   /api/auth/logout` — Logout (requires authentication)
- `POST   /api/auth/global-logout` — Logout from all devices (requires authentication)
- `GET    /api/auth/health` — Health check for auth service

## Environment Variables
- `AUTH_SERVICE_URL` — The base URL for the Auth Service (default: `http://auth-service:3000`)

## Usage Notes
- All requests and responses are transparently proxied between the client and the Auth Service.
- Required headers (e.g., `Authorization`, `Content-Type`) are forwarded automatically.
- Error responses from the Auth Service are returned as-is by the gateway.

## Testing
You can test the endpoints using tools like curl, Postman, or PowerShell. Example registration:

```
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!",
    "email": "testuser@example.com",
    "nicNumber": "123456789V",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Implementation Details
- See `backend/api-gateway/src/routes/auth.js` for proxy logic.
- See `backend/api-gateway/src/app.js` for route registration.

---
_Last updated: 2025-08-16_
