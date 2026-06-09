# Data Dictionary — Smart Maize Insights

**Database:** `maize_detection_systemai`
**Total Tables:** 6

---

## 1. `roles`

Stores available user roles for access control.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique role identifier |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | Role name (e.g., 'admin', 'user') |
| `description` | VARCHAR(255) | NULLABLE | Human-readable description of the role |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

**Seed Data:**
| id | name | description |
|---|---|---|
| 1 | admin | Administrator with full access |
| 2 | user | Standard user with limited access |

---

## 2. `users`

Stores registered user accounts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| `phone` | VARCHAR(30) | UNIQUE, NOT NULL | User's phone number |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt-hashed password |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `role_id` | INT, FK | DEFAULT 2 → `roles.id` | Foreign key to roles table |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether the account is active |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |

**Relationships:** `role_id` references `roles.id` (SET NULL on delete)

---

## 3. `chat_sessions`

Groups chat messages into sessions per user.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique session identifier |
| `user_id` | INT, FK | NOT NULL → `users.id` | Owner of the session |
| `session_name` | VARCHAR(255) | NULLABLE | Optional name for the session |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Session creation date |

**Relationships:** `user_id` references `users.id` (CASCADE on delete)

---

## 4. `chat_conversation`

Individual messages within a chat session.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique message identifier |
| `chat_session_id` | INT, FK | NOT NULL → `chat_sessions.id` | Parent session |
| `role` | ENUM('user','assistant') | NOT NULL | Who sent the message |
| `content` | TEXT | NOT NULL | Message text content |
| `image_url` | VARCHAR(500) | NULLABLE | URL of attached image |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

**Relationships:** `chat_session_id` references `chat_sessions.id` (CASCADE on delete)

---

## 5. `diseases`

Catalog of known maize diseases.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique disease identifier |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | Common disease name |
| `scientific_name` | VARCHAR(255) | NULLABLE | Scientific/Latin name |
| `description` | TEXT | NULLABLE | Detailed description |
| `severity_level` | ENUM('low','medium','high','critical') | DEFAULT 'medium' | Severity classification |
| `crop_type` | VARCHAR(100) | DEFAULT 'maize' | Affected crop type |
| `symptoms` | TEXT | NULLABLE | Observable symptoms |
| `treatment` | TEXT | NULLABLE | Recommended treatment |
| `prevention` | TEXT | NULLABLE | Prevention measures |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether the disease is active in the system |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

---

## 6. `analysis_results`

ML model output from image analysis.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Unique result identifier |
| `chat_message_id` | INT, FK | NOT NULL → `chat_conversation.id` | Linked chat message |
| `disease_id` | INT, FK | NULLABLE → `diseases.id` | Detected disease reference |
| `image_path` | VARCHAR(500) | NULLABLE | Server-side image file path |
| `disease_detected` | BOOLEAN | DEFAULT FALSE | Whether a disease was found |
| `disease_name` | VARCHAR(255) | NULLABLE | Name of detected disease |
| `confidence_score` | DECIMAL(5,2) | NULLABLE | ML confidence (0.00–100.00) |
| `is_healthy` | BOOLEAN | DEFAULT FALSE | Whether the crop is healthy |
| `processing_time_ms` | INT | NULLABLE | ML inference time in milliseconds |
| `affected_area_percentage` | DECIMAL(5,2) | NULLABLE | Estimated % of affected area |
| `urgency_level` | ENUM('low','medium','high','critical') | DEFAULT 'medium' | Urgency of intervention |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Analysis timestamp |

**Relationships:**
- `chat_message_id` references `chat_conversation.id` (CASCADE on delete)
- `disease_id` references `diseases.id` (SET NULL on delete)

---

## Entity Relationship Diagram

```
roles 1 ──── ∞ users 1 ──── ∞ chat_sessions 1 ──── ∞ chat_conversation 1 ──── ∞ analysis_results
                                                                          │
diseases 1 ───────────────────────────────────────────────────────────────┘
```

- A **role** has many **users**
- A **user** has many **chat sessions**
- A **chat session** has many **chat messages**
- A **chat message** has one **analysis result** (optional)
- An **analysis result** may reference one **disease**
