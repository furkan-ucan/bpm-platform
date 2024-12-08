# Database Documentation

## MongoDB Schema

### Collections Overview

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  role: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Processes Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  version: Number,
  status: String,
  bpmnXml: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### Tasks Collection
```javascript
{
  _id: ObjectId,
  processId: ObjectId,
  name: String,
  description: String,
  assignee: ObjectId,
  status: String,
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

### Users Collection
```javascript
{ email: 1 }, { unique: true }
{ role: 1 }
```

### Processes Collection
```javascript
{ name: 1 }
{ createdBy: 1 }
{ status: 1 }
```

### Tasks Collection
```javascript
{ processId: 1 }
{ assignee: 1 }
{ status: 1 }
{ dueDate: 1 }
```

## Validation Rules

### Users Collection
```javascript
{
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        role: {
          enum: ["admin", "user", "manager"]
        }
      }
    }
  }
}
```

## Relationships

- Tasks.processId → Processes._id
- Tasks.assignee → Users._id
- Processes.createdBy → Users._id

## Backup Strategy

1. Daily full backup
2. Hourly incremental backups
3. Point-in-time recovery enabled
4. Geo-redundant backup storage

## Security

1. Field-level encryption for sensitive data
2. Access control via MongoDB roles
3. TLS/SSL encryption for connections
4. Audit logging enabled
