---
id: task-8.1
title: "Implement Broadcast Message Endpoint"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P2", "broadcast", "messaging"]
milestone: "M8 - Broadcast & Journal Tools"
dependencies: ["task-1.4"]
estimated_hours: 5
---

## Description
Implement the endpoint for sending broadcast messages (text-only in MVP, D-049) to fan lists via email and SMS using Resend and Twilio.

## Acceptance Criteria
- [ ] POST /v1/broadcast endpoint implemented
- [ ] Requires authentication
- [ ] Accepts: list_ids (array), subject, body (text-only, D-049)
- [ ] Fetches contacts from selected lists with opted_in = true
- [ ] Sends batch emails via Resend (max 1000 recipients per batch)
- [ ] Sends individual SMS via Twilio (rate limit: 10/sec)
- [ ] Records broadcast in broadcast_messages table
- [ ] Returns success with recipient_count
- [ ] Proper error handling (API failures, invalid lists)

## Implementation Plan
1. Create POST /v1/broadcast route in api/controllers/broadcast/index.ts
2. Apply requireAuth middleware
3. Parse request body: list_ids[], subject, body
4. Validate body is text-only (D-049: no attachments in MVP)
5. Query contacts: SELECT * FROM contacts WHERE list_id IN (?) AND opted_in = true
6. Extract email addresses and phone numbers
7. Send emails via Resend:
   - Batch recipients into groups of 1000
   - POST /emails/batch for each batch
   - Include unsubscribe link in all emails
   - Set from address: "{artist_name} via Umbrella <broadcast@umbrella.app>"
8. Send SMS via Twilio:
   - Loop through phone numbers
   - POST /Messages.json for each
   - Rate limit: sleep 100ms between sends (10/sec)
   - Include opt-out instructions in SMS
9. Insert broadcast record into broadcast_messages table:
   - artist_id, subject, body, recipient_count, sent_at, list_ids
10. Return 201 Created with success message

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 16-17 (Message Fans Tool)
- docs/initial-spec/eng-spec.md - D-049 (Text-only broadcasts in MVP)
- docs/initial-spec/architecture.md - Resend/Twilio integration
- db/schema.sql - broadcast_messages, contacts tables

**Priority:** P2 - Fan communication tool
**File:** api/controllers/broadcast/index.ts
**Can Run Parallel With:** task-8.2, task-8.3

**DEPENDENCY NOTE:** Requires task-1.4 (Authentication Middleware) complete. Cannot implement authenticated endpoints without the requireAuth middleware.

**EXTERNAL SERVICE INTEGRATION:** Initial development can use mocked Resend/Twilio responses for testing. Real email/SMS integration requires task-10.7 (External Service Config) complete for production use.
