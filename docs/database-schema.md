# Database Schema Documentation

## Overview

The BPM Platform uses MongoDB as its primary database. The schema is designed to support business process management with features like version control, access control, and audit logging.

## Collections

### Users Collection
Stores user information and authentication details.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // Hashed
  role_id: ObjectId,
  is_active: Boolean,
  profile_picture: String,
  preferred_language: String,
  created_at: Date,
  updated_at: Date
}

Indexes:
- email: unique
- role_id: 1
```

### Roles Collection
Defines user roles and their permissions.

```javascript
{
  _id: ObjectId,
  role_name: String,
  permissions: [String],
  created_at: Date
}

Indexes:
- role_name: unique
```

### Access Control Lists Collection
Manages fine-grained access control for entities.

```javascript
{
  _id: ObjectId,
  role_id: ObjectId,
  entity: String,
  entity_id: ObjectId,
  permissions: [String],
  created_at: Date
}

Indexes:
- role_id: 1
- entity: 1
- entity_id: 1
```

### Processes Collection
Stores business process definitions and metadata.

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  creator_id: ObjectId,
  bpmn_data: String,
  status: String,
  version: Number,
  category: String,
  tags: [String],
  created_at: Date,
  updated_at: Date
}

Indexes:
- creator_id: 1
- status: 1
- category: 1
- tags: 1
```

### Process Versions Collection
Maintains version history of processes.

```javascript
{
  _id: ObjectId,
  process_id: ObjectId,
  bpmn_data: String,
  version_number: Number,
  created_at: Date,
  created_by: ObjectId
}

Indexes:
- process_id: 1
- version_number: 1
```

### Activities Collection
Tracks individual activities within processes.

```javascript
{
  _id: ObjectId,
  process_id: ObjectId,
  name: String,
  type: String,
  status: String,
  assigned_to: ObjectId,
  priority: String,
  notes: String,
  due_date: Date,
  started_at: Date,
  completed_at: Date,
  created_at: Date,
  updated_at: Date
}

Indexes:
- process_id: 1
- assigned_to: 1
- status: 1
- due_date: 1
```

### Tasks Collection
Manages individual tasks within activities.

```javascript
{
  _id: ObjectId,
  activity_id: ObjectId,
  assigned_to: ObjectId,
  status: String,
  due_date: Date,
  reminders: [Date],
  created_at: Date,
  updated_at: Date
}

Indexes:
- activity_id: 1
- assigned_to: 1
- status: 1
- due_date: 1
```

### Workflow History Collection
Records all workflow actions and changes.

```javascript
{
  _id: ObjectId,
  process_id: ObjectId,
  activity_id: ObjectId,
  user_id: ObjectId,
  action_taken: String,
  timestamp: Date,
  comments: String
}

Indexes:
- process_id: 1
- activity_id: 1
- user_id: 1
- timestamp: 1
```

### Reports Collection
Stores generated reports and their parameters.

```javascript
{
  _id: ObjectId,
  process_id: ObjectId,
  report_type: String,
  data: Object,
  filters: Object,
  generated_at: Date
}

Indexes:
- process_id: 1
- report_type: 1
- generated_at: 1
```

### Notifications Collection
Manages system notifications for users.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  process_id: ObjectId,
  message: String,
  type: String,
  is_read: Boolean,
  created_at: Date
}

Indexes:
- user_id: 1
- process_id: 1
- is_read: 1
- created_at: 1
```

## Data Relationships

### One-to-Many Relationships
- User -> Processes (creator_id)
- Process -> Activities
- Activity -> Tasks
- User -> Notifications

### Many-to-Many Relationships
- Users <-> Roles (through role_id)
- Roles <-> Permissions (embedded in roles)
- Users <-> Activities (through assigned_to)

## Validation Rules

### Users
- Email must be unique and valid format
- Password must be hashed before storage
- Role_id must reference existing role

### Processes
- Name must be unique per user
- Version must be incremented automatically
- BPMN data must be valid XML

### Activities
- Due date must be future date
- Status must be one of: ['pending', 'active', 'completed', 'cancelled']
- Assigned_to must reference existing user

## Indexes and Performance

### Compound Indexes
```javascript
// Activities Collection
{ process_id: 1, status: 1, due_date: 1 }
{ assigned_to: 1, status: 1 }

// Workflow History Collection
{ process_id: 1, timestamp: -1 }
```

### Text Indexes
```javascript
// Processes Collection
{ name: "text", description: "text" }
```

## Data Migration and Backup

### Backup Strategy
- Daily full backup
- Hourly incremental backups
- 30-day retention period

### Migration Scripts
Located in `/backend/migrations/`
- Follow semantic versioning
- Include both up and down migrations
- Automated through deployment pipeline
