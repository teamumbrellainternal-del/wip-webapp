---

### task-11.2.md

```markdown
---
id: task-11.2
title: "Generate Database Schema Documentation"
status: "To Do"
assignee: []
created_date: "2025-11-16"
labels: ["documentation", "P1", "automation", "database"]
milestone: "M11 - Documentation & Developer Tooling"
dependencies: []
estimated_hours: null
---

## Description
Auto-generate database schema documentation from db/schema.sql and db/migrations/ using Claude Code. Create a reference that shows table relationships, foreign keys, indexes, and which API endpoints read/write to each table.

## Acceptance Criteria
- [ ] docs/DATABASE.md created with all 27 tables documented
- [ ] For each table, document:
  - Columns with types, constraints, defaults
  - Primary keys and indexes
  - Foreign key relationships (visual diagram if possible)
  - Which API endpoints read from this table
  - Which API endpoints write to this table
  - Example queries for common operations
- [ ] Relationship diagram (Mermaid ER diagram or ASCII art)
- [ ] Migration history reference (which migration created which table)
- [ ] Cross-references to API_SURFACE.md (which endpoints use which tables)
- [ ] Query optimization notes (which columns should be indexed)
- [ ] File validates against actual schema in D1

## Implementation Plan

### 1. Create Claude Code Prompt
```
Prompt: "Read db/schema.sql and db/migrations/*.sql to generate docs/DATABASE.md 
with the following structure:

# Database Schema

## Overview
- Total tables: 27
- Database: D1 (SQLite)
- Migrations applied: 0001-0007 + clerk integration

## Table Relationships Diagram
```mermaid
erDiagram
    users ||--o{ artists : has
    artists ||--o{ tracks : uploads
    artists ||--o{ gigs : applies_to
    users {
        string id PK
        string clerk_user_id UK
        string email
        boolean onboarding_complete
    }
    artists {
        string id PK
        string user_id FK
        string stage_name
        text bio
    }
    [...]
```

## Tables

### users
**Purpose:** User accounts from Clerk OAuth

**Columns:**
- id (TEXT, PRIMARY KEY)
- clerk_user_id (TEXT, UNIQUE) - Clerk's user ID
- email (TEXT) - Primary email
- onboarding_complete (BOOLEAN) - Whether onboarding finished
- created_at (DATETIME)
- updated_at (DATETIME)

**Indexes:**
- idx_users_clerk_id ON (clerk_user_id)

**Relationships:**
- HAS ONE artist (artists.user_id → users.id)

**Used By Endpoints:**
- POST /v1/auth/callback (writes)
- GET /v1/auth/session (reads)
- POST /v1/onboarding/artists/step5 (writes onboarding_complete)

**Common Queries:**
```sql
-- Get user with artist profile
SELECT u.*, a.* 
FROM users u 
LEFT JOIN artists a ON a.user_id = u.id 
WHERE u.clerk_user_id = ?

-- Check onboarding status
SELECT onboarding_complete 
FROM users 
WHERE clerk_user_id = ?
```

[Continue for all 27 tables...]

Use actual schema from db/schema.sql to ensure accuracy.
Cross-reference API_SURFACE.md to show endpoint usage.
Include migration references (which migration created this table).
"
```

### 2. Run Generation
- Point Claude Code at db/schema.sql and db/migrations/
- Generate initial draft of DATABASE.md
- Create Mermaid ER diagram if possible

### 3. Add Endpoint Mappings
- For each table, list which endpoints read/write
- Cross-reference to API_SURFACE.md
- Note any endpoints that JOIN multiple tables

### 4. Add Query Examples
- Common SELECT patterns (with JOINs)
- Common UPDATE/INSERT patterns
- Performance considerations (which queries need indexes)

### 5. Validation Pass
- Verify all 27 tables documented
- Check foreign key relationships are correct
- Ensure migration references are accurate

## Notes & Comments
**References:**
- db/schema.sql - Primary schema definition
- db/migrations/*.sql - Migration history
- docs/API_SURFACE.md - Endpoint → table mappings
- db/MIGRATION_STATUS.md - Applied migrations (from task-0.1)

**Priority:** P1 - Critical for understanding data model
**File:** docs/DATABASE.md
**Can Run Parallel With:** task-11.1, task-11.3, task-11.4, task-11.5

**Why This Matters:**
Post-MVP, database changes are risky. Need to know: "If I add a column to artists table, what breaks?" This document shows all endpoints that touch each table.

**Example Use Case:**
```
Client: "Can we add 'verified_at' timestamp to artists?"
Developer: [Reads DATABASE.md]
Developer: "artists table used by: GET /v1/profile, PUT /v1/profile, GET /v1/artists"
Agent: [Ingests only: DATABASE.md, db/schema.sql, 3 endpoint files]
Agent: [Adds column, updates 3 endpoints]
---


