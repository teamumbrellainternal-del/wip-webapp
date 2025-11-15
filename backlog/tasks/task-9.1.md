---
id: task-9.1
title: "Implement Violet AI Prompt Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P2", "violet", "ai"]
milestone: "M9 - Violet AI Integration"
dependencies: ["task-1.4"]
estimated_hours: 4
---

## Description
Implement the endpoint that proxies prompts to Claude API with context-specific prompt templates (D-046) and rate limiting (D-062: 50 prompts/day).

## Acceptance Criteria
- [ ] POST /v1/violet/prompt endpoint implemented
- [ ] Requires authentication
- [ ] Accepts: user_prompt (string), context (string: draft_message/gig_inquiry/songwriting/career_advice)
- [ ] Checks rate limit: 50 prompts/day per artist (D-062)
- [ ] Loads appropriate system prompt template based on context
- [ ] Calls Claude API (claude-sonnet-4-5-20250929)
- [ ] Returns AI-generated response
- [ ] Increments usage counter in KV
- [ ] Logs usage to violet_usage table
- [ ] Proper error handling (rate limit exceeded, API failure)

## Implementation Plan
1. Create POST /v1/violet/prompt route in api/controllers/violet/index.ts
2. Apply requireAuth middleware
3. Parse request body: user_prompt, context
4. Check rate limit (D-062):
   - Get today's date (YYYY-MM-DD)
   - Fetch from KV: violet:{artist_id}:{date}
   - If count >= 50: return 429 "Daily limit reached"
5. Load system prompt template based on context:
   - draft_message: "You are Violet, helping an artist write a fan message..."
   - gig_inquiry: "You are Violet, helping an artist write a gig inquiry..."
   - songwriting: "You are Violet, helping an artist with songwriting..."
   - career_advice: "You are Violet, providing career guidance..."
6. Call Claude API:
   - POST https://api.anthropic.com/v1/messages
   - Headers: x-api-key, anthropic-version, content-type
   - Body: {model, max_tokens: 1024, system, messages: [{role: "user", content: user_prompt}]}
7. Parse response: data.content[0].text
8. Increment KV counter: violet:{artist_id}:{date} += 1 (TTL: 24 hours)
9. Log to D1: INSERT INTO violet_usage (artist_id, prompt_date, prompt_count, feature_used, prompt_text)
10. Return JSON with ai_response and remaining_prompts

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-046 (Real AI via Claude API)
- docs/initial-spec/eng-spec.md - D-062 (50 prompts/day limit)
- docs/initial-spec/architecture.md - Claude API integration
- db/schema.sql - violet_usage table

**Priority:** P2 - Core Violet feature
**File:** api/controllers/violet/index.ts
**Can Run Parallel With:** task-9.2, task-9.3
