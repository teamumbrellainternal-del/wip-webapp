---
id: task-11.4
title: "Consolidate TypeScript Interfaces"
status: "To Do"
assignee: []
created_date: "2025-11-16"
labels: ["documentation", "P1", "types"]
milestone: "M11 - Documentation & Developer Tooling"
dependencies: []
estimated_hours: null
---

## Description
Organize and consolidate existing TypeScript interfaces from types/ directory into a clear, documented structure. Ensure all types are properly exported and cross-referenced for easy agent consumption.

## Acceptance Criteria
- [ ] types/ directory organized with clear file structure
- [ ] All interfaces have JSDoc comments explaining purpose
- [ ] types/index.ts exports all public types
- [ ] types/api.ts contains all request/response interfaces
- [ ] types/models.ts contains all database model interfaces
- [ ] types/services.ts contains all external service contracts
- [ ] No duplicate type definitions across files
- [ ] All types referenced in API_SURFACE.md and DATABASE.md
- [ ] README.md in types/ directory explaining organization

## Implementation Plan

### 1. Audit Existing Types
- Scan types/ directory for all .ts files
- Identify duplicate definitions
- Note missing types (referenced in code but not defined)

### 2. Organize Into Categories
```
types/
├── index.ts              # Central export file
├── api.ts                # Request/response interfaces
├── models.ts             # Database models
├── services.ts           # External service contracts
├── env.ts                # Environment variables
├── utils.ts              # Utility types
└── README.md             # Organization guide
```

### 3. Add JSDoc Comments
```typescript
/**
 * Artist profile data model
 * @see DATABASE.md for table schema
 * @see API_SURFACE.md for endpoints using this model
 */
export interface Artist {
  id: string
  user_id: string
  stage_name: string
  bio: string | null
  // ...
}

/**
 * Request body for onboarding step 1
 * @endpoint POST /v1/onboarding/artists/step1
 * @see api/routes/onboarding.ts
 */
export interface OnboardingStep1Request {
  stage_name: string
  location_city: string
  location_state: string
  inspirations?: string
  genre_primary?: string[]
}
```

### 4. Create Central Export
```typescript
// types/index.ts
export * from './api'
export * from './models'
export * from './services'
export * from './env'
export * from './utils'
```

### 5. Add Cross-References
- Reference API_SURFACE.md in API types
- Reference DATABASE.md in model types
- Reference task IDs in service types

### 6. Create types/README.md
```markdown
# TypeScript Types Organization

## Structure
- `api.ts` - Request/response interfaces for all API endpoints
- `models.ts` - Database models (matches db/schema.sql)
- `services.ts` - External service contracts (Resend, Twilio, Clerk, etc.)
- `env.ts` - Environment variable types
- `utils.ts` - Utility types (branded types, helpers)

## Usage
```typescript
import { Artist, OnboardingStep1Request } from '@/types'
```

## Adding New Types
1. Choose appropriate file (api, models, services, etc.)
2. Add JSDoc comment explaining purpose
3. Cross-reference docs (API_SURFACE.md, DATABASE.md)
4. Export from that file (no need to update index.ts)

## Conventions
- Use PascalCase for interfaces/types
- Suffix request types with `Request`
- Suffix response types with `Response`
- Database models match table names (singular, PascalCase)
```

### 7. Validation Pass
- All types properly exported
- No circular dependencies
- JSDoc comments are helpful (not generic)
- Cross-references are accurate

## Notes & Comments
**References:**
- types/ directory - Existing type definitions
- docs/API_SURFACE.md - Cross-reference for API types
- docs/DATABASE.md - Cross-reference for model types
- db/schema.sql - Source of truth for database models

**Priority:** P1 - Enables type-safe agent changes
**File:** types/*.ts, types/README.md
**Can Run Parallel With:** task-11.1, task-11.2, task-11.3, task-11.5

**Why This Matters:**
Well-organized types make it easy for agents to:
1. Understand data structures without reading implementation
2. Make type-safe changes (TypeScript catches errors)
3. Find related code (follow type references)

**Example Use Case:**
```
Agent Task: "Add 'pronouns' field to Artist model"
Agent: [Reads types/models.ts]
Agent: "Artist interface defined, used by: ProfileEditPage, GET /v1/profile"
Agent: [Updates: types/models.ts, db/schema.sql, api/routes/profile.ts, ProfileEditPage.tsx]
Agent: [TypeScript compiler validates all changes]

```

**What's Already Done:**
Most types likely already exist from M0-M10. This task just organizes and documents them, not creates from scratch.
```

