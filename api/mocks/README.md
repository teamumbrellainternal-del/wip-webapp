# Mock Services

Mock implementations of external services for development/preview without API credentials.

## When Mocks Are Used

- `USE_MOCKS=true` in environment (preview/dev)
- API credentials missing
- Default if not specified

## Available Mocks

| Mock | File | Real Service |
|------|------|--------------|
| Email | `resend.ts` | Resend |
| SMS | `twilio.ts` | Twilio |
| AI | `claude.ts` | Claude API |
| Storage | `r2.ts` | Cloudflare R2 |

## Usage

```typescript
import { getEmailService, getSMSService, getAIService, getStorageService } from '../mocks'

// Automatically returns mock or real based on env.USE_MOCKS
const emailService = getEmailService(env)
const smsService = getSMSService(env)
const aiService = getAIService(env)
const storageService = getStorageService(env)
```

## Behavior

**Mock Email/SMS:**
- Logs to console instead of sending
- Stores last 100 messages in memory
- Validates addresses/phone numbers

**Mock Claude:**
- Returns pre-defined responses by prompt type
- Tracks usage in memory (50 prompts/day limit)
- Prompt types: `draft_message`, `gig_inquiry`, `songwriting`, `bio_generator`, `general`

**Mock R2:**
- Generates mock signed URLs
- Tracks files in memory (lost on restart)
- Enforces 50GB quota per artist

## Console Output

All mocks log operations:
```
[MOCK RESEND] Email sent to: artist@example.com
[MOCK TWILIO] SMS sent to: +1234567890
[MOCK CLAUDE] AI generation: bio_generator (150 tokens)
[MOCK R2] Signed URL for: artist_123/track.mp3
```

## Switching to Real Services

1. Set secrets:
```bash
wrangler secret put RESEND_API_KEY
wrangler secret put CLAUDE_API_KEY
# Twilio not implemented yet
```

2. Set in environment:
```toml
[vars]
USE_MOCKS = "false"
```

## Limitations

- **Email/SMS**: No actual delivery
- **Claude**: Pre-defined responses only
- **R2**: In-memory only (no persistence)
