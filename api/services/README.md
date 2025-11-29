# External Services

API wrappers for external services.

## Services

| Service | File | Status |
|---------|------|--------|
| Claude AI | `claude.ts` | **Implemented** - Powers Violet |
| Resend Email | `resend.ts` | **Implemented** - Transactional & broadcast |
| Pusher | `pusher.ts` | **Implemented** - Real-time messaging |
| Twilio SMS | `twilio.ts` | **Not connected** - Service exists but unused |

## Claude AI (`claude.ts`)

Powers the Violet AI assistant.

```typescript
import { createClaudeService } from './services/claude'

const claude = createClaudeService(env.CLAUDE_API_KEY, env.DB)

const result = await claude.generateResponse({
  prompt: 'Help me write a bio',
  promptType: 'bio_generator',
  artistId: 'artist-123',
  maxTokens: 500
})

// Check daily limit (50 prompts/day)
const usage = await claude.checkDailyLimit('artist-123')
```

**Prompt Types:** `draft_message`, `gig_inquiry`, `songwriting`, `bio_generator`, `general`

## Resend Email (`resend.ts`)

```typescript
import { createResendService } from './services/resend'

const resend = createResendService(env.RESEND_API_KEY, env.DB)

// Transactional email
await resend.sendTransactional('welcome', 'user@example.com', { artistName: 'John' })

// Broadcast (batches 1000 recipients)
await resend.sendBroadcast({
  recipients: ['user1@example.com', 'user2@example.com'],
  subject: 'New Release',
  html: '<h1>Check it out!</h1>',
  artistId: 'artist-123'
})
```

## Pusher (`pusher.ts`)

Real-time messaging for conversations.

```typescript
import { createPusherService } from './services/pusher'

const pusher = createPusherService(env)

// Trigger event
await pusher.trigger('private-user-123', 'new-message', { messageId: 'msg-456' })

// Auth for private channels (used by /v1/pusher/auth endpoint)
const auth = pusher.authorizeChannel(socketId, channelName)
```

## Shared Utilities

**`retry-helper.ts`** - Exponential backoff for API calls:
```typescript
import { withRetry } from './services/retry-helper'

const result = await withRetry(async () => await apiCall(), {
  maxRetries: 3,
  initialDelayMs: 1000
})
```

**`types.ts`** - ServiceResult type for consistent error handling

## Environment Variables

```bash
CLAUDE_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...
```
