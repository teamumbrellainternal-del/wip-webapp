---
id: task-0.2
title: "Define API Contracts (OpenAPI/JSON Schema)"
status: "Done"
assignee: []
created_date: "2025-11-15"
completed_date: "2025-11-15"
labels: ["backend", "frontend", "P0", "documentation", "api-design"]
milestone: "M0 - Pre-Development Setup"
dependencies: []
estimated_hours: 2
actual_hours: 2
---

## Description
Create comprehensive API contract documentation for all 50+ endpoints in the Umbrella MVP. This contract defines request/response schemas, field names, types, validation rules, and error responses. Frontend and backend teams use this contract as the single source of truth to prevent integration failures during parallel development.

## Acceptance Criteria
- [x] API contract document created: `docs/API_CONTRACT.md` OR `openapi.yaml`
- [x] All endpoints from M1-M10 documented (50+ endpoints)
- [x] For each endpoint, document:
  - HTTP method and path
  - Request schema (headers, body, query params)
  - Response schema (success and error cases)
  - Field names, types, required/optional status
  - Validation rules (min/max length, format, enums)
  - Authentication requirements
- [x] Common error responses documented (400, 401, 403, 404, 500)
- [x] Session structure documented in `docs/SESSIONS.md`
- [ ] Contract reviewed and approved by frontend and backend leads
- [ ] Contract shared with all developers before M1 starts

## Implementation Plan

### 1. Choose Contract Format
**Option A: OpenAPI 3.0** (Recommended if using API tools)
- Formal specification
- Tooling support (Swagger UI, code generation)
- Industry standard

**Option B: Markdown with JSON Schema** (Recommended for simplicity)
- Easy to read and maintain
- No special tooling required
- Flexible format

### 2. Document Endpoint Categories

#### Auth Endpoints (M1)
- POST /v1/auth/callback
- GET /v1/auth/session
- POST /v1/auth/logout

#### Onboarding Endpoints (M2)
- POST /v1/onboarding/artists/step1
- POST /v1/onboarding/artists/step2
- POST /v1/onboarding/artists/step3
- POST /v1/onboarding/artists/step4
- POST /v1/onboarding/artists/step5
- GET /v1/onboarding/artists/review

#### Profile Endpoints (M3)
- GET /v1/artists/:artistId
- PUT /v1/artists/:artistId
- POST /v1/artists/:artistId/tracks
- GET /v1/artists/:artistId/tracks
- POST /v1/artists/:artistId/reviews
- GET /v1/artists/:artistId/reviews

#### Analytics Endpoints (M4)
- GET /v1/analytics/dashboard
- GET /v1/analytics/spotlight

#### Marketplace Endpoints (M5)
- GET /v1/gigs (search/filter)
- POST /v1/gigs/:gigId/apply
- GET /v1/artists/discover

#### Messaging Endpoints (M6)
- GET /v1/conversations
- GET /v1/conversations/:convId
- POST /v1/conversations
- POST /v1/conversations/:convId/messages
- GET /v1/conversations/:convId/messages
- POST /v1/conversations/:convId/book-artist

#### File Endpoints (M7)
- POST /v1/files/upload/request-url
- POST /v1/files/upload/confirm
- GET /v1/files
- DELETE /v1/files/:fileId

#### Broadcast Endpoints (M8)
- POST /v1/broadcasts
- POST /v1/journals
- GET /v1/broadcasts/analytics

#### Violet AI Endpoints (M9)
- POST /v1/violet/generate
- GET /v1/violet/usage
- GET /v1/violet/rate-limit

#### Testing/Deployment Endpoints (M10)
- (No new endpoints, focus on testing)

### 3. Define Session Structure
Create `docs/SESSIONS.md` with:
- Session token format (JWT structure)
- Session storage mechanism (KV)
- Session TTL (24 hours)
- Session payload fields:
  ```json
  {
    "user_id": "string",
    "oauth_id": "string",
    "oauth_provider": "apple" | "google",
    "email": "string",
    "onboarding_complete": boolean,
    "created_at": "timestamp",
    "expires_at": "timestamp"
  }
  ```
- Session validation logic
- Session refresh policy (if applicable)

### 4. Document Common Patterns

#### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Success Response Format
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

#### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "stage_name",
      "issue": "Field is required"
    }
  }
}
```

#### Common Error Codes
- 400 BAD_REQUEST - Validation errors
- 401 UNAUTHORIZED - Invalid/expired token
- 403 FORBIDDEN - Insufficient permissions
- 404 NOT_FOUND - Resource not found
- 500 INTERNAL_SERVER_ERROR - Server errors

### 5. Create Example Requests/Responses
For critical endpoints, include example:
- Successful request with all fields
- Error request with validation failure
- Edge cases (empty arrays, null values, max length)

### 6. Review with Team
- Share draft with frontend lead
- Share draft with backend lead
- Incorporate feedback
- Finalize and publish to team

## Notes & Comments
**References:**
- api/routes/ directory - All route definitions
- docs/initial-spec/eng-spec.md - Business requirements for each endpoint
- docs/initial-spec/architecture.md - API architecture patterns

**Priority:** P0 - BLOCKS all parallel frontend/backend work
**File:** docs/API_CONTRACT.md or openapi.yaml
**Dependencies:** None (can run in parallel with task-0.1 and task-0.3)
**Unblocks:** ALL Phase 2-9 parallel development (prevents integration failures)

**CRITICAL:** Frontend and backend developers MUST reference this contract during implementation. Any deviation from the contract should be flagged immediately and contract updated with team approval.

**Why This Task Exists:**
Identified in REFINEMENT_REPORT_pt2.md Issue #3 - The execution plan calls for massive parallelization in Phase 2 (12 agents simultaneously), but without a shared API contract, frontend and backend will make incompatible assumptions about field names, data types, and response structures. This causes integration failures when components are merged.

**Contract Example (Markdown Format):**

```markdown
# API Contract - Umbrella MVP

## POST /v1/auth/callback
**Description:** Handle OAuth callback from Cloudflare Access

**Request:**
- Headers:
  - `Cf-Access-Jwt-Assertion`: JWT from OAuth provider
- Body: None

**Response (200):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "artist@example.com",
      "onboarding_complete": false
    },
    "redirect_url": "/onboarding/step1"
  }
}
```

**Errors:**
- 401: Invalid JWT signature
- 500: Database error

(Continue for all endpoints...)
```

## Implementation Checklist
- [ ] Choose contract format (OpenAPI vs Markdown)
- [ ] Create contract document file
- [ ] Document all M1-M10 endpoints (50+)
- [ ] Create `docs/SESSIONS.md` with session structure
- [ ] Document common error responses
- [ ] Add example requests/responses for critical endpoints
- [ ] Review with frontend lead
- [ ] Review with backend lead
- [ ] Incorporate feedback
- [ ] Publish final version to team
- [ ] Brief team on contract usage during development
