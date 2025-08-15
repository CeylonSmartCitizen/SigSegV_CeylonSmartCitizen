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

## Testing
- Automated tests for notification logic
