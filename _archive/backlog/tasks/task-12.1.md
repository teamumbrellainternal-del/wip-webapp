---
id: task-11.1
title: "Generate API Surface Map"
status: "To Do"
assignee: []
created_date: "2025-11-16"
labels: ["documentation", "P1", "automation"]
milestone: "M11 - Documentation & Developer Tooling"
dependencies: []
estimated_hours: null
---

## Description
Auto-generate comprehensive API endpoint documentation from the api/routes/ directory using Claude Code. Create a machine-readable and human-readable reference of all REST endpoints with their contracts, authentication requirements, and database dependencies.

## Acceptance Criteria
- [ ] docs/API_SURFACE.md created with all 50+ endpoints documented
- [ ] For each endpoint, document:
  - HTTP method and path (e.g., `POST /v1/onboarding/artists/step1`)
  - Authentication requirement (requireAuth, requireOnboarding, public)
  - Request parameters (headers, body fields, query params)
  - Response schema (success and error cases)
  - Database tables touched (reads/writes)
  - Dependencies on other endpoints or services
- [ ] Endpoints grouped by domain (Auth, Onboarding, Profile, Marketplace, etc.)
- [ ] Cross-references to database tables in DATABASE.md
- [ ] Cross-references to TypeScript types in types/ directory
- [ ] Examples of successful requests and responses
- [ ] Machine-readable format (can be parsed by future agents)
- [ ] File validates against actual codebase (no outdated info)

## Implementation Plan

### 1. Create Claude Code Prompt
```
Prompt: "Scan the api/routes/ directory and generate docs/API_SURFACE.md 
with the following structure:

# API Surface Map

## Authentication Endpoints
### POST /v1/auth/callback
- **Auth:** Public
- **Purpose:** Handle OAuth callback from Clerk
- **Request:** 
  - Headers: Cf-Access-Jwt-Assertion
- **Response:**
  ```json
  {
    "data": {
      "token": "string",
      "user": { ... },
      "redirect_url": "string"
    }
  }
  ```
- **Database:** Writes to users table
- **Dependencies:** Clerk webhook (task-1.1)
- **Types:** User (types/models.ts)

[Continue for all endpoints...]

## Onboarding Endpoints
[...]

## Profile Endpoints
[...]

Use actual code from api/routes/*.ts to ensure accuracy.
Group by milestone/domain (M1 Auth, M2 Onboarding, etc.).
Include error responses (400, 401, 403, 404, 500).
"
```

### 2. Run Generation
- Point Claude Code at api/routes/ directory
- Generate initial draft of API_SURFACE.md
- Validate against actual endpoint implementations

### 3. Add Metadata
- Cross-reference database tables (reference DATABASE.md)
- Link to TypeScript types (reference types/api.ts)
- Add dependency notes (which endpoints depend on others)

### 4. Validation Pass
- Verify all endpoints from M1-M10 included
- Check request/response schemas match actual code
- Ensure no deprecated or removed endpoints documented

### 5. Format for Machine Readability
- Consistent structure for each endpoint
- Parseable by LLMs (clear sections, predictable format)
- Include YAML front-matter if helpful for tooling

## Notes & Comments
**References:**
- api/routes/ directory - All endpoint implementations
- docs/API_CONTRACT.md - Created in task-0.2 (may be outdated)
- types/api.ts - Request/response TypeScript interfaces

**Priority:** P1 - Highest ROI documentation (enables surgical API changes)
**File:** docs/API_SURFACE.md
**Can Run Parallel With:** task-11.2, task-11.3, task-11.4, task-11.5

**Why This Matters:**
Post-MVP, every API change requires understanding: "What does this endpoint do? What breaks if I change it?" This document answers those questions without re-ingesting entire codebase.

**Example Use Case:**
```
Client: "Can we add 'pronouns' field to artist profile?"
Developer: [Reads API_SURFACE.md]
Developer: "Profile uses PUT /v1/profile → touches artists table → used by ProfileEditPage.tsx"
Agent: [Ingests only: API_SURFACE.md, api/routes/profile.ts, db/schema.sql (artists table), ProfileEditPage.tsx]
Agent: [Makes surgical change in 4 files]
