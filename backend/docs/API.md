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

### User Management

#### Create User
```http
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "user",
  "settings": {
    "language": "en",
    "timezone": "UTC"
  }
}
```

#### Get User
```http
GET /api/v1/users/{userId}
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/v1/users/{userId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "John Updated",
  "settings": {
    "language": "fr"
  }
}
```

### Process Management

#### Create Process
```http
POST /api/v1/processes
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Invoice Approval",
  "description": "Process for approving invoices",
  "bpmn_data": "<bpmn>...</bpmn>",
  "metadata": {
    "category": "Finance",
    "tags": ["invoice", "approval"],
    "priority": 2
  }
}
```

#### List Processes
```http
GET /api/v1/processes?status=active&category=Finance
Authorization: Bearer <token>
```

Response:
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Invoice Approval",
      "description": "Process for approving invoices",
      "status": "active",
      "version": 1,
      "metadata": {
        "category": "Finance",
        "tags": ["invoice", "approval"],
        "priority": 2
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "per_page": 20
  }
}
```

### Task Management

#### Create Task
```http
POST /api/v1/tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "process_id": "507f1f77bcf86cd799439011",
  "name": "Review Invoice",
  "description": "Review invoice details and approve/reject",
  "assignee": "507f1f77bcf86cd799439012",
  "due_date": "2024-01-15T00:00:00Z",
  "priority": 2
}
```

#### Update Task Status
```http
PATCH /api/v1/tasks/{taskId}/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "completed",
  "comment": "Invoice approved and processed"
}
```

### Reports

#### Generate Process Report
```http
POST /api/v1/reports/process/{processId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "performance",
  "date_range": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "metrics": ["completion_time", "bottlenecks", "costs"]
}
```

## Webhooks

### Register Webhook
```http
POST /api/v1/webhooks
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://your-system.com/webhook",
  "events": ["process.completed", "task.assigned"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload Example
```json
{
  "event": "process.completed",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "process_id": "507f1f77bcf86cd799439011",
    "name": "Invoice Approval",
    "completion_time": 3600,
    "final_status": "approved"
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `429`: Too Many Requests
- `500`: Internal Server Error

## Security

### Rate Limiting
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### CORS Configuration
```javascript
{
  "origin": ["https://your-domain.com"],
  "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
  "allowedHeaders": ["Content-Type", "Authorization"],
  "exposedHeaders": ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
  "maxAge": 86400
}
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "user";
  settings: {
    language: string;
    timezone: string;
    theme: string;
  };
  created_at: string;
  updated_at: string;
}
```

### Process Model
```typescript
interface Process {
  id: string;
  name: string;
  description: string;
  version: number;
  status: "draft" | "active" | "completed" | "archived";
  bpmn_data: string;
  metadata: {
    category: string;
    tags: string[];
    priority: number;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

## Query Parameters

### Filtering
```http
GET /api/v1/processes?status=active&category=Finance&priority=high
```

### Pagination
```http
GET /api/v1/tasks?page=2&per_page=20
```

### Sorting
```http
GET /api/v1/processes?sort=created_at:desc,name:asc
```

### Field Selection
```http
GET /api/v1/users?fields=id,name,email
```

## Versioning

The API is versioned through the URL path:
```
https://api.bpm-platform.com/v1/
```

### Version History
- `v1`: Current stable version
- `v2`: Beta (contact support for access)

## Development Tools

### Postman Collection
Download our Postman collection for easy API testing:
[BPM Platform API Collection](https://api.bpm-platform.com/postman/collection.json)

### API Client Libraries
- [JavaScript SDK](https://github.com/bpm-platform/js-sdk)
- [Python SDK](https://github.com/bpm-platform/python-sdk)
- [Java SDK](https://github.com/bpm-platform/java-sdk)

## Support

For API support:
- Email: api-support@bpm-platform.com
- Documentation: https://docs.bpm-platform.com
- Status Page: https://status.bpm-platform.com
