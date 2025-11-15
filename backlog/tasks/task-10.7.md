---
id: task-10.7
title: "Configure External Service APIs"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["backend", "P2", "integrations", "configuration"]
milestone: "M10 - Testing, Bug Fixes & Deployment"
dependencies: []
estimated_hours: 3
---

## Description
Set up and test external service integrations: Resend (email), Twilio (SMS), Claude (AI), and R2 (storage). This task is intentionally deferred to M10 to prioritize visual progress, as these services can be mocked during initial development.

## Acceptance Criteria
- [ ] Resend API configured with API key in environment variables
- [ ] Test email sent successfully via Resend
- [ ] Email templates created for notifications (gig bookings, messages)
- [ ] Twilio API configured with account SID and auth token
- [ ] Test SMS sent successfully via Twilio
- [ ] SMS templates created for notifications (D-045: SMS for bookings)
- [ ] Claude API configured with API key
- [ ] Test AI prompt generation working (artist bio, cover letter, EPK)
- [ ] R2 bucket configured with proper CORS settings
- [ ] Test signed URL generation and file upload to R2
- [ ] All API credentials stored in Cloudflare secrets (not in code)
- [ ] Error handling for API failures (rate limits, network errors)

## Implementation Plan
### 1. Resend Email Configuration
1. Sign up for Resend account and obtain API key
2. Add RESEND_API_KEY to wrangler.toml secrets
3. Install @resend/resend package
4. Create email templates in api/templates/email/
5. Test email send: api/utils/email.ts sendEmail() function
6. Verify delivery to test addresses

### 2. Twilio SMS Configuration
1. Sign up for Twilio account and obtain credentials
2. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to secrets
3. Add TWILIO_PHONE_NUMBER to environment
4. Install twilio package
5. Create SMS helper in api/utils/sms.ts
6. Test SMS send to verified numbers
7. Implement templates for booking notifications (D-045)

### 3. Claude AI Configuration
1. Obtain Anthropic API key
2. Add ANTHROPIC_API_KEY to secrets
3. Install @anthropic-ai/sdk package
4. Create prompt templates in api/utils/ai-prompts.ts
5. Test bio generation (D-058)
6. Test cover letter generation (D-074)
7. Test EPK generation (D-066)
8. Implement token usage tracking for rate limits (D-059: 25k tokens/month)

### 4. R2 Storage Configuration
1. Create R2 bucket: umbrella-files-production
2. Configure CORS for presigned URLs
3. Add R2 binding to wrangler.toml
4. Test signed URL generation for upload
5. Test signed URL generation for download (24-hour expiry per D-028)
6. Verify file metadata storage in D1 after upload

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - D-045 (SMS notifications), D-058 (AI bio), D-059 (25k token limit)
- docs/initial-spec/eng-spec.md - D-066 (EPK generation), D-074 (Cover letter), D-028 (24hr download links)
- docs/initial-spec/architecture.md - External service integration patterns
- wrangler.toml - Environment configuration

**Priority:** P2 - Deferred for client visibility (visual features first)
**File:** api/utils/email.ts, api/utils/sms.ts, api/utils/ai-prompts.ts
**Dependencies:** None (can run anytime, but deferred to M10)
**Unblocks:** Full functionality testing of tasks 7.1 (R2), 8.1 (AI), 8.4 (Broadcasts), 9.1 (Violet)

**STRATEGY:** Initial development of tasks 7.1, 8.1, 8.4, 9.1 should use mocked responses. Real integration happens in M10 after UI is demonstrable to client.
