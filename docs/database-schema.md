# Database Schema Documentation

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        ObjectId user_id PK
        String name
        String email
        String password
        ObjectId role_id FK
        Boolean is_active
        String profile_picture
        String preferred_language
        Date created_at
        Date updated_at
    }

    ROLES {
        ObjectId role_id PK
        String role_name
        String[] permissions
        Date created_at
    }

    ACCESSCONTROL_LISTS {
        ObjectId acl_id PK
        ObjectId role_id FK
        String entity
        ObjectId entity_id
        String[] permissions
        Date created_at
    }

    PROCESSES {
        ObjectId process_id PK
        String name
        String description
        ObjectId creator_id FK
        String bpmn_data
        String status
        Number version
        String category
        String[] tags
        Date created_at
        Date updated_at
    }

    PROCESS_VERSIONS {
        ObjectId version_id PK
        ObjectId process_id FK
        String bpmn_data
        Number version_number
        Date created_at
        ObjectId created_by FK
    }

    ACTIVITIES {
        ObjectId activity_id PK
        ObjectId process_id FK
        String name
        String type
        String status
        ObjectId assigned_to FK
        String priority
        String notes
        Date due_date
        Date started_at
        Date completed_at
        Date created_at
        Date updated_at
    }

    TASKS {
        ObjectId task_id PK
        ObjectId activity_id FK
        ObjectId assigned_to FK
        String status
        Date due_date
        Date[] reminders
        Date created_at
        Date updated_at
    }

    WORKFLOW_HISTORY {
        ObjectId history_id PK
        ObjectId process_id FK
        ObjectId activity_id FK
        ObjectId user_id FK
        String action_taken
        Date timestamp
        String comments
    }

    REPORTS {
        ObjectId report_id PK
        ObjectId process_id FK
        String report_type
        Object data
        Object filters
        Date generated_at
    }

    NOTIFICATIONS {
        ObjectId notification_id PK
        ObjectId user_id FK
        ObjectId process_id FK
        String message
        String type
        Boolean is_read
        Date created_at
    }

    COMMENTS {
        ObjectId comment_id PK
        ObjectId user_id FK
        String entity
        ObjectId entity_id FK
        String comment
        Date created_at
    }

    FILES {
        ObjectId file_id PK
        ObjectId uploaded_by FK
        String entity
        ObjectId entity_id FK
        String file_name
        String file_type
        Number file_size
        String file_path
        Date uploaded_at
    }

    INTEGRATION_SETTINGS {
        ObjectId integration_id PK
        ObjectId user_id FK
        String service_name
        String api_key
        String api_secret
        Object settings
        Date created_at
    }

    TRANSLATIONS {
        ObjectId translation_id PK
        String key
        Object translations
    }

    SLA_DEFINITIONS {
        ObjectId sla_id PK
        String name
        String description
        Number target_time
        String applicable_to
        ObjectId entity_id FK
        Date created_at
    }

    SLA_TRACKING {
        ObjectId tracking_id PK
        ObjectId sla_id FK
        ObjectId entity_id FK
        Date start_time
        Date end_time
        String status
        String remarks
    }

    AUDIT_LOGS {
        ObjectId log_id PK
        ObjectId user_id FK
        String action
        String entity
        ObjectId entity_id FK
        Date timestamp
        Object details
    }

    ERROR_LOGS {
        ObjectId error_id PK
        String message
        String stack_trace
        ObjectId user_id FK
        Date occurred_at
        Boolean resolved
        Date resolved_at
        ObjectId resolved_by FK
    }

    %% İlişkiler

    USERS ||--o{ ROLES : "has"
    ROLES ||--o{ ACCESSCONTROL_LISTS : "manages"
    USERS ||--o{ ACCESSCONTROL_LISTS : "has access"
    USERS ||--o{ PROCESSES : "creates"
    PROCESSES ||--|{ PROCESS_VERSIONS : "has versions"
    USERS ||--o{ PROCESS_VERSIONS : "created by"
    PROCESSES ||--o{ ACTIVITIES : "includes"
    ACTIVITIES ||--o{ TASKS : "contains"
    PROCESSES ||--o{ WORKFLOW_HISTORY : "has history"
    ACTIVITIES ||--o{ WORKFLOW_HISTORY : "has history"
    USERS ||--o{ WORKFLOW_HISTORY : "performed by"
    PROCESSES ||--o{ REPORTS : "generates"
    USERS ||--o{ NOTIFICATIONS : "receives"
    PROCESSES ||--o{ NOTIFICATIONS : "related to"
    USERS ||--o{ COMMENTS : "writes"
    ACTIVITIES ||--o{ COMMENTS : "has comments"
    TASKS ||--o{ COMMENTS : "has comments"
    USERS ||--o{ FILES : "uploads"
    PROCESSES ||--o{ FILES : "has files"
    ACTIVITIES ||--o{ FILES : "has files"
    TASKS ||--o{ FILES : "has files"
    USERS ||--o{ INTEGRATION_SETTINGS : "configures"
    PROCESSES ||--o{ SLA_DEFINITIONS : "has SLA"
    ACTIVITIES ||--o{ SLA_DEFINITIONS : "has SLA"
    SLA_DEFINITIONS ||--o{ SLA_TRACKING : "tracked by"
    PROCESSES ||--o{ SLA_TRACKING : "tracked by"
    USERS ||--o{ AUDIT_LOGS : "logs"
    AUDIT_LOGS ||--o{ PROCESSES : "logs process"
    AUDIT_LOGS ||--o{ ACTIVITIES : "logs activity"
    AUDIT_LOGS ||--o{ TASKS : "logs task"
    USERS ||--o{ ERROR_LOGS : "encounters"
    ERROR_LOGS ||--o{ USERS : "resolved by"
```

## Indexes and Performance Optimization

### Collection Indexes

1. Users Collection
```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role_id": 1 })
```

2. Processes Collection
```javascript
db.processes.createIndex({ "creator_id": 1 })
db.processes.createIndex({ "status": 1 })
db.processes.createIndex({ "category": 1 })
db.processes.createIndex({ "tags": 1 })
```

3. Activities Collection
```javascript
db.activities.createIndex({ "process_id": 1 })
db.activities.createIndex({ "assigned_to": 1 })
db.activities.createIndex({ "status": 1 })
db.activities.createIndex({ "due_date": 1 })
```

## Data Validation Rules

### Users Collection
```javascript
{
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "name"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        password: {
          bsonType: "string",
          minLength: 8
        }
      }
    }
  }
}
```

### Processes Collection
```javascript
{
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "creator_id", "status"],
      properties: {
        status: {
          enum: ["draft", "active", "completed", "archived"]
        }
      }
    }
  }
}
```

## Backup Strategy

1. Daily Full Backup
```bash
mongodump --uri="mongodb://localhost:27017/bpm_platform" --out=/backup/daily/$(date +%Y%m%d)
```

2. Hourly Incremental Backup
```bash
mongodump --uri="mongodb://localhost:27017/bpm_platform" --out=/backup/hourly/$(date +%Y%m%d_%H) --incremental
```

3. Point-in-Time Recovery
- Oplog retention: 24 hours
- Backup retention: 30 days

## Security Considerations

1. Field Level Encryption
```javascript
{
  "integration_settings": {
    "api_key": {
      "$encrypt": {
        "keyId": ["UUID"],
        "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512_Random"
      }
    }
  }
}
```

2. Access Control
```javascript
db.createRole({
  role: "processViewer",
  privileges: [
    {
      resource: { db: "bpm_platform", collection: "processes" },
      actions: [ "find" ]
    }
  ],
  roles: []
})
