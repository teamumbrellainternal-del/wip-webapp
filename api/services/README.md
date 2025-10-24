# External Service Integration Layer

This directory contains API wrappers for external services used by the Umbrella platform.

## Services

### 1. Resend Email Service (`resend.ts`)

Email delivery service with retry logic and queue system.

**Features:**
- Transactional email templates (welcome, booking confirmation, message notification, review invitation)
- Broadcast email batching (1000 recipients per call)
- Automatic unsubscribe link injection
- Delivery logging to D1
- Failed delivery queue with exponential backoff retry

**Usage:**
```typescript
import { createResendService } from './services/resend'

const resendService = createResendService(env.RESEND_API_KEY, env.DB)

// Send transactional email
await resendService.sendTransactional('welcome', 'user@example.com', {
  artistName: 'John Doe',
  profileUrl: 'https://umbrella.app/profile/123'
})

// Send broadcast
await resendService.sendBroadcast({
  recipients: ['user1@example.com', 'user2@example.com'],
  subject: 'New Music Release',
  html: '<h1>Check out my new track!</h1>',
  artistId: 'artist-123',
  unsubscribeUrl: 'https://umbrella.app/unsubscribe/token'
})

// Process queued emails (call from cron)
await resendService.processQueue()
```

### 2. Twilio SMS Service (`twilio.ts`)

SMS delivery service with rate limiting and queue system.

**Features:**
- SMS delivery (outbound only)
- Booking confirmation SMS
- Broadcast SMS with rate limiting (10 messages/second)
- Delivery logging to D1
- Failed delivery queue with exponential backoff retry
- STOP/HELP handling (automatic via Twilio)

**Usage:**
```typescript
import { createTwilioService } from './services/twilio'

const twilioService = createTwilioService(
  env.TWILIO_ACCOUNT_SID,
  env.TWILIO_AUTH_TOKEN,
  env.TWILIO_PHONE_NUMBER,
  env.DB
)

// Send booking confirmation
await twilioService.sendBookingConfirmation('+12345678900', {
  gigTitle: 'Summer Music Fest',
  date: '2024-07-15',
  location: 'Central Park',
  rate: 500
}, 'artist-123')

// Send broadcast
await twilioService.sendBroadcast({
  recipients: ['+12345678900', '+10987654321'],
  message: 'New show announced! Get tickets at umbrella.app',
  artistId: 'artist-123'
})

// Process queued SMS (call from cron)
await twilioService.processQueue()
```

### 3. Claude API Service (`claude.ts`)

Violet AI service wrapper with placeholder responses.

**IMPORTANT:** Returns placeholder responses in Release 1. Real Claude API integration will be added in future release per D-046.

**Features:**
- Daily usage limit (50 prompts/day per artist)
- Usage tracking and cost estimation
- Prompt templates for different use cases
- Placeholder responses for MVP

**Usage:**
```typescript
import { createClaudeService } from './services/claude'

const claudeService = createClaudeService(env.CLAUDE_API_KEY, env.DB)

// Generate AI response (placeholder in Release 1)
const result = await claudeService.generateResponse({
  prompt: 'Help me write a message to a venue owner',
  promptType: 'draft_message',
  artistId: 'artist-123',
  maxTokens: 500
})

if (result.success) {
  console.log(result.data.response) // Placeholder response
  console.log(result.data.isPlaceholder) // true in Release 1
}

// Check daily usage limit
const usage = await claudeService.checkDailyLimit('artist-123')
console.log(`${usage.currentCount}/${usage.limit} prompts used today`)

// Get usage statistics
const stats = await claudeService.getUsageStats('artist-123', 30)
console.log(`Total prompts: ${stats.totalPrompts}`)
console.log(`By feature:`, stats.byFeature)
```

## Shared Utilities

### Retry Helper (`retry-helper.ts`)

Exponential backoff retry logic for all services.

**Usage:**
```typescript
import { withRetry } from './services/retry-helper'

const result = await withRetry(async () => {
  // Your async operation here
  return await someAPICall()
}, {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2
})

if (result.success) {
  console.log('Success:', result.data)
} else {
  console.error('Failed:', result.error.message)
  console.log('Retryable?', result.error.retryable)
}
```

### Types (`types.ts`)

TypeScript types and interfaces for all services.

## Database Tables

The services use the following D1 tables (created by migration `0006_delivery_queues.sql`):

- `email_delivery_queue` - Failed email queue
- `sms_delivery_queue` - Failed SMS queue
- `email_delivery_log` - Email delivery history
- `sms_delivery_log` - SMS delivery history
- `unsubscribe_list` - Email unsubscribe list
- `violet_usage` - Violet AI usage tracking (from migration `0005_analytics.sql`)

## Environment Variables

Required in `wrangler.toml`:

```toml
[env.dev]
# ... other config ...

[vars]
RESEND_API_KEY = "re_..."
TWILIO_ACCOUNT_SID = "AC..."
TWILIO_AUTH_TOKEN = "..."
TWILIO_PHONE_NUMBER = "+1..."
CLAUDE_API_KEY = "sk-ant-..."
```

## Background Processing

Both email and SMS services have queue processing methods that should be called periodically via Cloudflare Cron Triggers:

```typescript
// In your Worker's scheduled handler
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Process failed deliveries every 5 minutes
    const resendService = createResendService(env.RESEND_API_KEY, env.DB)
    const twilioService = createTwilioService(
      env.TWILIO_ACCOUNT_SID,
      env.TWILIO_AUTH_TOKEN,
      env.TWILIO_PHONE_NUMBER,
      env.DB
    )

    await Promise.all([
      resendService.processQueue(),
      twilioService.processQueue()
    ])
  }
}
```

## Error Handling

All services return `ServiceResult<T>` which includes:
- `success`: boolean
- `data`: Response data (if successful)
- `error`: Error object with code, message, and retryable flag

This allows consistent error handling across all services.

## Rate Limiting

- **Resend**: No explicit rate limit in MVP (Resend handles this)
- **Twilio**: 10 messages/second enforced by built-in rate limiter
- **Claude**: 50 prompts/day per artist enforced by usage tracking

## Future Enhancements

- Real-time webhook handling for delivery status (Resend/Twilio)
- Advanced email templates with variables and layouts
- SMS shortlink tracking
- Real Claude API integration with streaming responses
- Cost analytics and budget alerts
- A/B testing for email templates
