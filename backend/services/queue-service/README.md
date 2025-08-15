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
