---
id: task-9.2
title: "Implement Violet Usage Tracking Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P2", "violet"]
milestone: "M9 - Violet AI Integration"
dependencies: ["task-9.1"]
estimated_hours: 2
---

## Description
Implement the endpoint that returns Violet usage statistics for the current artist, showing prompts used today and remaining.

## Acceptance Criteria
- [ ] GET /v1/violet/usage endpoint implemented
- [ ] Requires authentication
- [ ] Returns: prompts_used_today, prompts_remaining, daily_limit (50)
- [ ] Fetches count from KV: violet:{artist_id}:{date}
- [ ] Returns historical usage data (last 7 days)
- [ ] Proper error handling

## Implementation Plan
1. Create GET /v1/violet/usage route in api/controllers/violet/usage.ts
2. Apply requireAuth middleware
3. Get today's date (YYYY-MM-DD)
4. Fetch current usage from KV: violet:{artist_id}:{date}
5. Calculate prompts_used_today (default 0 if key not found)
6. Calculate prompts_remaining = 50 - prompts_used_today (D-062)
7. Query D1 for last 7 days usage:
   - SELECT prompt_date, COUNT(*) FROM violet_usage WHERE artist_id = ? AND prompt_date >= DATE('now', '-7 days') GROUP BY prompt_date
8. Return JSON with current usage, remaining, daily_limit, and historical data

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-062 (50 prompts/day limit)
- docs/initial-spec/architecture.md - KV rate limiting
- db/schema.sql - violet_usage table

**Priority:** P2 - Violet UX feature
**File:** api/controllers/violet/usage.ts
**Dependencies:** Requires task-9.1 (prompt endpoint for KV structure)
