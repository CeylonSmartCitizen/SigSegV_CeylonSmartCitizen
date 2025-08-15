# Document Service

Handles document upload, management, verification, and expiry for CeylonSmartCitizen.

## Features
- Secure file upload (PDF, JPG, PNG)
- Document metadata storage (PostgreSQL)
- List, download, verify, delete, and expire documents
- JWT authentication and authorization
- Configurable storage and security settings

## Endpoints
- `POST /documents/upload` — Upload document (multipart/form-data)
- `GET /documents?user_id=...` — List user's documents
- `GET /documents/:id` — Get document metadata
- `GET /documents/:id/download` — Download document (auth required)
- `PUT /documents/:id/status` — Update verification status
- `PATCH /documents/:id/expire` — Expire document
- `DELETE /documents/:id` — Delete document

## Config
- `src/config/storage.js` — Storage paths, file size, MIME types
- `src/config/database.js` — Prisma DB connection
- `src/config/security.js` — JWT secret, CORS options

## Middleware
- `authMiddleware.js` — JWT authentication
- `corsMiddleware.js` — CORS

## Testing
- `tests/documentTest.js` — Automated endpoint tests

---

# Notification Service

Handles multi-channel notifications (app, email, SMS) for CeylonSmartCitizen.

## Features
- Create, list, and mark notifications as read
- System-wide broadcast notifications
- Multi-channel support (app, email, SMS)
- Notification history and delivery status

## Endpoints
- `POST /notifications` — Create notification
- `GET /notifications/user/:userId` — List user notifications
- `PATCH /notifications/:id/read` — Mark as read
- `GET /notifications` — List all notifications (admin)
- `DELETE /notifications/:id` — Delete notification
- `POST /notifications/broadcast` — System-wide broadcast (admin)

## Config
- `src/config/` — Security, email, SMS settings

## Middleware
- JWT authentication, CORS

---

# Queue Service

Manages queue sessions, entries, and real-time updates for CeylonSmartCitizen.

## Features
- Create and manage queue sessions
- Add, update, and list queue entries
- Officer status and queue controls
- Real-time updates via Socket.io
- Notification triggers for queue events

## Endpoints
- `POST /queue-sessions` — Create queue session
- `GET /queue-sessions/:id` — Get session details
- `POST /queue-entries` — Add queue entry
- `PUT /queue-entries/:id` — Update queue entry
- `GET /queue-entries?session_id=...` — List entries for session
- `PATCH /queue-sessions/:id/status` — Update session status

## Real-Time
- Socket.io events for queue position, pause/resume, user called

## Config
- `src/config/` — Database, Socket.io, Redis

## Middleware
- JWT authentication, CORS

## Testing
- Automated tests for queue logic
