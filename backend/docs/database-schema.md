# 📚 BPM Platform Database Schema

## 🎯 Overview

Our BPM Platform uses MongoDB as its primary database, implementing a comprehensive schema design that supports all business process management functionalities. This document details the collections, relationships, and optimization strategies.

## 🗄️ Core Collections

### Entity Relationship Diagram

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

    WORKFLOW_HISTORY ||--|{ USERS : "performed by"
    WORKFLOW_HISTORY ||--|{ PROCESSES : "belongs to"
    WORKFLOW_HISTORY ||--|{ ACTIVITIES : "tracks"

    USERS ||--o{ ROLES : "has"
    ROLES ||--o{ ACCESSCONTROL_LISTS : "manages"
    USERS ||--o{ ACCESSCONTROL_LISTS : "has access"
    USERS ||--o{ PROCESSES : "creates"
    PROCESSES ||--|{ PROCESS_VERSIONS : "has versions"
    USERS ||--o{ PROCESS_VERSIONS : "created by"
    PROCESSES ||--o{ ACTIVITIES : "includes"
    ACTIVITIES ||--o{ TASKS : "contains"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ COMMENTS : "writes"
    USERS ||--o{ FILES : "uploads"
    USERS ||--o{ INTEGRATION_SETTINGS : "configures"
```

## 📦 Collection Details

### 👤 Users & Authentication

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,            // User's full name
  email: String,           // Unique email address
  password: String,        // Hashed password
  role_id: ObjectId,       // Reference to ROLES
  is_active: Boolean,      // Account status
  profile_picture: String, // URL to profile picture
  settings: {
    language: String,      // Preferred language
    timezone: String,      // User's timezone
    theme: String         // UI theme preference
  },
  created_at: Date,
  updated_at: Date
}
```

### 🔐 Access Control

#### Roles Collection
```javascript
{
  _id: ObjectId,
  role_name: String,      // e.g., "admin", "manager", "user"
  permissions: [String],  // Array of permission codes
  created_at: Date
}
```

### 📋 Process Management

#### Processes Collection
```javascript
{
  _id: ObjectId,
  name: String,           // Process name
  description: String,    // Process description
  creator_id: ObjectId,   // Reference to USERS
  bpmn_data: String,     // BPMN 2.0 XML
  status: String,        // ["draft", "active", "completed", "archived"]
  version: Number,       // Current version number
  category: String,      // Process category
  tags: [String],        // Search tags
  metadata: {
    priority: Number,    // Process priority
    estimated_time: Number,
    cost_center: String
  },
  created_at: Date,
  updated_at: Date
}
```

## 🔍 Indexing Strategy

### 🎯 Performance Indexes

```javascript
// Users Collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role_id": 1 })

// Processes Collection
db.processes.createIndex({ "creator_id": 1 })
db.processes.createIndex({ "status": 1 })
db.processes.createIndex({ "category": 1 })
db.processes.createIndex({ "tags": 1 })

// Activities Collection
db.activities.createIndex({ "process_id": 1 })
db.activities.createIndex({ "assigned_to": 1 })
db.activities.createIndex({ "status": 1, "due_date": 1 })
```

## 🛡️ Data Validation

### Validation Rules Example

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "role_id"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        role_id: {
          bsonType: "objectId"
        }
      }
    }
  }
})
```

## 📊 Performance Optimization

### 🚀 Query Optimization Tips

1. **Use Covered Queries**
   ```javascript
   // Good ✅
   db.users.find({ role_id: ObjectId("...") }, { email: 1, _id: 0 })
   
   // Avoid ❌
   db.users.find({ role_id: ObjectId("...") })
   ```

2. **Compound Indexes for Common Queries**
   ```javascript
   // For status + date range queries
   db.tasks.createIndex({ "status": 1, "due_date": 1 })
   ```

## 🔒 Security Measures

### 1. Field-Level Encryption
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

### 2. Access Control
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
```

## 💾 Backup Strategy

### 🔄 Automated Backups

1. **Daily Full Backup** (00:00 UTC)
```bash
mongodump --uri="mongodb://localhost:27017/bpm_platform" --out=/backup/daily/$(date +%Y%m%d)
```

2. **Hourly Incremental Backup**
```bash
mongodump --uri="mongodb://localhost:27017/bpm_platform" --out=/backup/hourly/$(date +%Y%m%d_%H) --incremental
```

### 🌍 Geo-Redundancy
- Primary backup: AWS S3
- Secondary backup: Azure Blob Storage
- Tertiary backup: Local NAS

## 📈 Monitoring & Alerts

### Key Metrics
- Query performance
- Index usage statistics
- Storage utilization
- Connection pool status

### Alert Thresholds
- Query execution time > 100ms
- Storage usage > 80%
- Connection pool usage > 85%
- Index miss rate > 5%
