# BPM Platform API Documentation

## API Overview

Base URL: `https://api.bpm-platform.com/v1`

## Authentication

All API requests require authentication using JWT tokens.

### Authentication Header
```
Authorization: Bearer <token>
```

## Endpoints

### Process Management

#### Create Process
```http
POST /processes
Content-Type: application/json

{
  "name": "Invoice Approval",
  "description": "Process for approving invoices",
  "bpmnXml": "<?xml version=\"1.0\"...>"
}
```

#### Get Process
```http
GET /processes/{processId}
```

#### List Processes
```http
GET /processes
```

### Task Management

#### Create Task
```http
POST /tasks
Content-Type: application/json

{
  "processId": "123",
  "name": "Review Invoice",
  "assignee": "user123",
  "dueDate": "2024-12-31T23:59:59Z"
}
```

#### Get Task
```http
GET /tasks/{taskId}
```

#### List Tasks
```http
GET /tasks
```

### User Management

#### Create User
```http
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin"
}
```

#### Get User
```http
GET /users/{userId}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INVALID_TOKEN`: Invalid authentication token
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `PERMISSION_DENIED`: Insufficient permissions

## Rate Limiting

- Rate limit: 1000 requests per hour
- Rate limit header: `X-RateLimit-Remaining`

## Versioning

The API is versioned using URL path versioning. The current version is `v1`.

## Testing

Test environment: `https://api-test.bpm-platform.com/v1`
