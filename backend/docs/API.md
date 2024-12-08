# API Documentation

## Overview

The BPM Platform API is organized around REST. Our API accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes and authentication.

## Base URL

```
Production: https://api.bpm-platform.com/v1
Development: http://localhost:3000/v1
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## API Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
```

### Processes

#### GET /processes
List all processes.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `status` (optional): Filter by process status
- `category` (optional): Filter by category

**Response:**
```json
{
  "data": [
    {
      "id": "process_id",
      "name": "Process Name",
      "description": "Process Description",
      "status": "active",
      "version": 1,
      "created_at": "2023-12-08T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

#### POST /processes
Create a new process.

**Request Body:**
```json
{
  "name": "New Process",
  "description": "Process Description",
  "bpmn_data": "BPMN XML Data",
  "category": "category_name",
  "tags": ["tag1", "tag2"]
}
```

### Activities

#### GET /processes/{processId}/activities
List all activities in a process.

**Path Parameters:**
- `processId`: ID of the process

**Response:**
```json
{
  "data": [
    {
      "id": "activity_id",
      "name": "Activity Name",
      "type": "task",
      "status": "pending",
      "assigned_to": "user_id",
      "due_date": "2023-12-31T00:00:00Z"
    }
  ]
}
```

### Tasks

#### PUT /tasks/{taskId}
Update a task status.

**Path Parameters:**
- `taskId`: ID of the task

**Request Body:**
```json
{
  "status": "completed",
  "comments": "Task completed successfully"
}
```

## Error Handling

The API uses conventional HTTP response codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error Response Format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## Rate Limiting

API calls are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1628785200
```

## Webhooks

The API supports webhooks for real-time notifications:

#### POST /webhooks
Register a new webhook.

**Request Body:**
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["process.created", "task.completed"],
  "active": true
}
```

## SDK & Examples

Code examples are available in multiple languages:

### Node.js
```javascript
const BPMPlatform = require('bpm-platform-sdk');
const client = new BPMPlatform('YOUR_API_KEY');

// List processes
client.processes.list()
  .then(processes => console.log(processes))
  .catch(error => console.error(error));
```

### Python
```python
from bpm_platform import BPMPlatform
client = BPMPlatform('YOUR_API_KEY')

# List processes
processes = client.processes.list()
print(processes)
```
