# Appointment Service API Documentation (via API Gateway)

This document provides a comprehensive reference for all appointment-related APIs available to frontend engineers via the API Gateway. It covers endpoints for appointments, departments, officers, services, and queue management. All endpoints are prefixed with `/api/` when accessed through the gateway.

---

## 1. Appointments

### Create Appointment
- **POST** `/api/appointments`
- **Body:**
  ```json
  {
    "service_id": "<uuid>",
    "preferred_date": "YYYY-MM-DD",
    "preferred_time": "HH:MM",
    "notes": "<optional string>"
  }
  ```
- **Response:**
  - `201 Created`
  - Success:
    ```json
    {
      "success": true,
      "data": {
        "id": "<uuid>",
        "user_id": "<uuid>",
        "service_id": "<uuid>",
        "officer_id": "<uuid>",
        "appointment_date": "YYYY-MM-DD",
        "appointment_time": "HH:MM",
        "status": "scheduled",
        "token_number": "A123",
        "estimated_wait_time": 20,
        "service": { ... },
        "officer": { ... }
      }
    }
    ```
  - Error: `400`/`404` with error details

### Get Appointments (User)
- **GET** `/api/appointments`
- **Query Params:**
  - `status` (optional): `scheduled|cancelled|completed|rescheduled`
  - `page` (default: 1), `limit` (default: 10)
  - `sort`: `date_asc|date_desc|created_asc|created_desc|status_asc|status_desc`
- **Response:**
  - `200 OK`
  - Success:
    ```json
    {
      "success": true,
      "data": {
        "appointments": [ ... ],
        "pagination": { ... }
      }
    }
    ```

### Update Appointment
- **PUT** `/api/appointments/:id`
- **Body:**
  ```json
  {
    "status": "cancelled|rescheduled|completed",
    "notes": "<optional string>"
  }
  ```
- **Response:**
  - `200 OK` on success, `404` if not found, `400` on invalid update

---

## 2. Departments

### List Departments
- **GET** `/api/departments`
- **Query Params:**
  - `active_only` (default: false)
  - `language`: `en|si|ta` (default: en)
  - `page`, `limit`, `search`
- **Response:**
  - `200 OK` with department list and metadata

### Get Department by ID
- **GET** `/api/departments/:id`
- **Query:** `language`
- **Response:**
  - `200 OK` with department details

### Get Department Services
- **GET** `/api/departments/:id/services`
- **Query:** `active_only`, `language`
- **Response:**
  - `200 OK` with list of services

### Get Department Status
- **GET** `/api/departments/:id/status`
- **Response:**
  - `200 OK` with operational status

### Get Department Officers
- **GET** `/api/departments/:id/officers`
- **Query:** `active_only`, `include_availability`
- **Response:**
  - `200 OK` with officer list

### Get Department Analytics
- **GET** `/api/departments/:id/analytics`
- **Query:** `date_from`, `date_to`
- **Response:**
  - `200 OK` with analytics data

### Get Department Overview
- **GET** `/api/departments/:id/overview`
- **Query:** `language`
- **Response:**
  - `200 OK` with comprehensive overview

### Search Departments
- **GET** `/api/departments/search`
- **Query:** `query`, `language`, `active_only`, `page`, `limit`
- **Response:**
  - `200 OK` with search results

### Get All Departments Operational Status
- **GET** `/api/departments/operational-status`
- **Query:** `active_only`
- **Response:**
  - `200 OK` with status summary

---

## 3. Officers

### List Officers
- **GET** `/api/officers`
- **Query:** `department_id`, `specializations`, `active_only`, `available_only`, `page`, `limit`, `search`
- **Response:**
  - `200 OK` with officer list

### Get Officer by ID
- **GET** `/api/officers/:id`
- **Response:**
  - `200 OK` with officer details

### Get Officers by Specialization
- **GET** `/api/officers/specialization/:specializations`
- **Query:** `department_id`, `active_only`
- **Response:**
  - `200 OK` with officer list

### Get Officer Availability
- **GET** `/api/officers/:id/availability/:date`
- **Response:**
  - `200 OK` with availability info

### Find Best Officer for Service
- **POST** `/api/officers/find-best-for-service`
- **Body:**
  ```json
  {
    "service_id": "<uuid>",
    "appointment_date": "YYYY-MM-DD",
    "appointment_time": "HH:MM",
    "required_specializations": ["spec1", "spec2"]
  }
  ```
- **Response:**
  - `200 OK` with best officer info

### Get Officer Statistics
- **GET** `/api/officers/:id/statistics`
- **Query:** `date_from`, `date_to`
- **Response:**
  - `200 OK` with statistics

### Get Officers Scheduled for Date
- **GET** `/api/officers/schedule/:date`
- **Query:** `department_id`
- **Response:**
  - `200 OK` with schedule

### Search Officers
- **GET** `/api/officers/search`
- **Query:** `query`, `department_id`, `specializations`, `active_only`, `page`, `limit`
- **Response:**
  - `200 OK` with search results

### Get Officer Availability Summary
- **GET** `/api/officers/availability-summary/:date`
- **Query:** `department_id`, `specialization`
- **Response:**
  - `200 OK` with summary

### Get All Specializations
- **GET** `/api/officers/specializations`
- **Query:** `department_id`
- **Response:**
  - `200 OK` with specialization list

---

## 4. Services

### List Services
- **GET** `/api/services`
- **Query:** `search`, `department_id`, `category`, `min_fee`, `max_fee`, `language`, `sort`, `page`, `limit`, `active_only`
- **Response:**
  - `200 OK` with service list, pagination, and filter options

### Get Service by ID
- **GET** `/api/services/:id`
- **Query:** `language`
- **Response:**
  - `200 OK` with service details and related services

### Get Service Categories
- **GET** `/api/services/categories`
- **Response:**
  - `200 OK` with category list

---

## 5. Queue Management

### Get Queue Status
- **GET** `/api/queue/status`
- **Query:** `user_id` (required, UUID), `appointment_id` (optional, UUID)
- **Response:**
  - `200 OK` with queue status
  - `404` if not in queue

### Join Queue
- **POST** `/api/queue/join`
- **Body:**
  ```json
  {
    "appointment_id": "<uuid>",
    "department_id": "<uuid>",
    "service_id": "<uuid>",
    "arrival_time": "YYYY-MM-DDTHH:MM:SSZ" // optional, ISO 8601
  }
  ```
- **Response:**
  - `201 Created` with queue position
  - `400`/`409` on error

### Get Active Queue Sessions
- **GET** `/api/queue/sessions`
- **Query:** `department_id` (optional)
- **Response:**
  - `200 OK` with session list

### Get Queue Session Details
- **GET** `/api/queue/session/:sessionId`
- **Query:** `page`, `limit`
- **Response:**
  - `200 OK` with session and queue entry details

### Advance Queue
- **PUT** `/api/queue/session/:sessionId/advance`
- **Response:**
  - `200 OK` with next person info

### Update Queue Entry Status
- **PUT** `/api/queue/entry/:entryId/status`
- **Body:**
  ```json
  { "status": "waiting|called|serving|completed|skipped" }
  ```
- **Response:**
  - `200 OK` on success

### Pause/Resume Queue Session
- **POST** `/api/queue/session/:sessionId/pause`
- **POST** `/api/queue/session/:sessionId/resume`
- **Response:**
  - `200 OK` on success

### Get Department Queue Analytics
- **GET** `/api/queue/analytics/:departmentId`
- **Query:** `date`
- **Response:**
  - `200 OK` with analytics

### Get Department Queue Statistics
- **GET** `/api/queue/statistics/:departmentId`
- **Query:** `date`
- **Response:**
  - `200 OK` with statistics

### Queue Health Check
- **GET** `/api/queue/health`
- **Response:**
  - `200 OK` with health info

---

## General Notes
- All endpoints return JSON.
- Most endpoints support `language` query param for localization (`en`, `si`, `ta`).
- Pagination: `page` and `limit` are standard for list endpoints.
- UUIDs are required for all resource IDs.
- Error responses include `success: false`, `error` object, and status code.
- Authentication is currently disabled for testing but will be required in production (JWT via Authorization header).

For detailed request/response examples or further clarification, refer to the backend code or request specific endpoint samples.
