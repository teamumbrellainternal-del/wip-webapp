# Mock External Services

This directory contains mock implementations for all external services used by Umbrella, enabling development and testing without requiring real API credentials or incurring costs.

## Purpose

Mock services allow development teams to:
- **Develop features** without waiting for M10 external service integration
- **Test locally** without API credentials or internet connectivity
- **Debug easily** with console logging of all service interactions
- **Iterate quickly** without rate limits or API costs
- **Run CI/CD** pipelines without external dependencies

## Available Mock Services

### 1. Mock Resend Email Service (`resend.ts`)

Simulates the Resend email API for transactional emails and broadcasts.

**Features:**
- Validates email addresses
- Logs all emails to console
- Stores sent emails in memory (last 100)
- Supports all email templates
- Simulates broadcast functionality

**Usage:**
```typescript
import { getEmailService } from '../mocks'

const emailService = getEmailService(env)

// Send single email
await emailService.sendEmail({
  to: 'artist@example.com',
  subject: 'Welcome to Umbrella!',
  html: '<h1>Welcome!</h1>',
})

// Send broadcast
await emailService.sendBroadcast({
  recipients: ['user1@example.com', 'user2@example.com'],
  subject: 'Newsletter',
  html: '<p>Monthly update</p>',
  artistId: 'artist_123',
  unsubscribeUrl: 'https://umbrella.app/unsubscribe',
})
```

### 2. Mock Twilio SMS Service (`twilio.ts`)

Simulates the Twilio SMS API for text messaging.

**Features:**
- Validates phone numbers (E.164 format)
- Enforces 1600 character SMS limit
- Logs all SMS to console
- Stores sent SMS in memory (last 100)
- Supports broadcast SMS

**Usage:**
```typescript
import { getSMSService } from '../mocks'

const smsService = getSMSService(env)

// Send single SMS
await smsService.sendSMS({
  to: '+1234567890',
  message: 'Your gig booking has been confirmed!',
  messageType: 'booking_confirmation',
  artistId: 'artist_123',
})

// Send broadcast
await smsService.sendBroadcast({
  recipients: ['+1234567890', '+0987654321'],
  message: 'Event reminder: Tomorrow at 8 PM',
  artistId: 'artist_123',
})
```

### 3. Mock Claude AI Service (`claude.ts`)

Simulates the Claude AI API (Violet) for AI-generated content.

**Features:**
- Returns pre-defined responses for each prompt type
- Enforces daily rate limit (50 prompts/day per D-062)
- Tracks token usage in memory
- Estimates tokens based on text length
- Logs all AI generations to console

**Supported Prompt Types:**
- `draft_message` - Generic message drafting
- `gig_inquiry` - Gig application messages
- `songwriting` - Lyric and song ideas
- `bio_generator` - Artist bios
- `general` - General advice

**Usage:**
```typescript
import { getAIService } from '../mocks'

const aiService = getAIService(env)

// Generate AI response
const result = await aiService.generateResponse({
  prompt: 'Write a bio for a jazz musician',
  promptType: 'bio_generator',
  artistId: 'artist_123',
  maxTokens: 500,
})

if (result.success) {
  console.log(result.data.response)
}

// Check daily usage
const usage = await aiService.getDailyUsage('artist_123')
console.log(`Used ${usage} / 50 prompts today`)
```

### 4. Mock R2 Storage Service (`r2.ts`)

Simulates Cloudflare R2 object storage for file uploads.

**Features:**
- Generates mock signed URLs
- Tracks files in memory
- Enforces 50GB quota per artist (per D-026)
- Simulates upload intent → confirmation flow
- Logs all storage operations to console

**Usage:**
```typescript
import { getStorageService } from '../mocks'

const storageService = getStorageService(env)

// Generate signed URL for upload
const { url, uploadId } = await storageService.generateSignedURL({
  key: 'artist_123/track_audio.mp3',
  expiresIn: 900, // 15 minutes
  contentType: 'audio/mpeg',
  maxSize: 50 * 1024 * 1024, // 50MB
  artistId: 'artist_123',
})

// Confirm upload after client uploads file
await storageService.confirmUpload({
  uploadId,
  key: 'artist_123/track_audio.mp3',
  size: 5 * 1024 * 1024, // 5MB
  artistId: 'artist_123',
})

// Check quota usage
const quota = await storageService.getQuotaUsage('artist_123')
console.log(`Using ${quota.used} / ${quota.total} bytes`)
```

## Service Factory

The service factory (`index.ts`) provides a centralized way to get services based on environment configuration.

**Usage:**
```typescript
import { getEmailService, getSMSService, getAIService, getStorageService } from '../mocks'

// Get services (automatically uses mocks or real based on env.USE_MOCKS)
const emailService = getEmailService(env)
const smsService = getSMSService(env)
const aiService = getAIService(env)
const storageService = getStorageService(env)

// Check service status
import { getServiceStatus } from '../mocks'
const status = getServiceStatus(env)
console.log(status)
// {
//   mockMode: true,
//   services: {
//     email: 'mock',
//     sms: 'mock',
//     ai: 'mock',
//     storage: 'mock'
//   }
// }
```

## Environment Configuration

To toggle between mock and real services, set the `USE_MOCKS` environment variable in `wrangler.toml`:

```toml
[vars]
USE_MOCKS = "true"  # Use mock services
# USE_MOCKS = "false"  # Use real services (M10+)
```

**Default Behavior:**
- If `USE_MOCKS` is not set, mocks are used by default
- If API credentials are missing, mocks are used automatically
- In M10, set `USE_MOCKS = "false"` and provide real API credentials

## Mock vs Real Service Comparison

| Feature | Mock | Real (M10+) |
|---------|------|-------------|
| **Email Delivery** | Logs to console only | Real delivery via Resend |
| **SMS Delivery** | Logs to console only | Real delivery via Twilio |
| **AI Generation** | Pre-defined responses | Real Claude API calls |
| **File Storage** | In-memory only (lost on restart) | Persistent R2 bucket storage |
| **Rate Limits** | Simulated in memory | Real API rate limits |
| **Quota Tracking** | In-memory tracking | Database + R2 metadata |
| **Cost** | Free | Per-usage API costs |
| **Internet Required** | No | Yes |
| **API Credentials** | Not required | Required |

## Console Logging

All mock services log their operations to the console for easy debugging:

```
[MOCK RESEND] Email sent:
  To: artist@example.com
  From: noreply@umbrella.app
  Subject: Welcome to Umbrella!
  Body: <h1>Welcome!</h1>...
  Message ID: mock_a1b2c3d4-e5f6-7890-abcd-ef1234567890

[MOCK TWILIO] SMS sent:
  To: +1234567890
  From: +15555551234
  Body: Your gig booking has been confirmed!
  SID: SM1234567890abcdef1234567890abcdef

[MOCK CLAUDE] AI generation:
  Prompt: Write a bio for a jazz musician...
  Type: bio_generator
  Tokens: 150
  Response: A versatile artist blending genres...

[MOCK R2] Signed URL generated:
  Key: artist_123/track_audio.mp3
  Upload ID: upload_abc123
  Max Size: 50MB
  Expires: 900 seconds
```

## Testing

Mock services include testing utilities:

```typescript
// Email service
const emailService = createMockResendService()
const sentEmails = emailService.getSentEmails()
emailService.clearSentEmails()

// SMS service
const smsService = createMockTwilioService()
const sentSMS = smsService.getSentSMS()
smsService.clearSentSMS()

// AI service
const aiService = createMockClaudeService()
const usage = await aiService.getUsageStats('artist_123', 30)
aiService.clearUsage()

// Storage service
const storageService = createMockR2Service()
const allFiles = storageService.getAllFiles()
const pendingUploads = storageService.getUploadIntents()
storageService.clearAll()
```

## Migration to Real Services

### ✅ Email Service - Connected and Ready!

The **Resend email service** is now connected to the factory and ready for production use!

**To enable in production:**
1. Configure API credential:
   ```bash
   wrangler secret put RESEND_API_KEY --env production
   ```

2. Set environment variable in `wrangler.toml`:
   ```toml
   [env.production]
   USE_MOCKS = "false"
   ```

3. Ensure D1 database is configured and accessible

**Features when enabled:**
- ✅ Real email delivery via Resend API
- ✅ Failed email queue with retry logic
- ✅ Delivery tracking and logging
- ✅ Unsubscribe list management
- ✅ Automatic fallback to mock if real service fails

### Remaining Services (Future Migration)

When migrating remaining services:

1. **Configure API credentials** in Cloudflare Workers secrets:
   ```bash
   wrangler secret put TWILIO_ACCOUNT_SID
   wrangler secret put TWILIO_AUTH_TOKEN
   wrangler secret put ANTHROPIC_API_KEY
   ```

2. **Test each service individually**:
   - Email service is already connected ✅
   - Next: SMS service (Twilio)
   - Then: AI service (Claude)
   - Finally: Storage service (R2)

3. **Keep mocks available** for development:
   - Use `USE_MOCKS = "true"` in dev environment
   - Use `USE_MOCKS = "false"` in production
   - Developers can still work without real credentials

## Limitations

**Mock Resend:**
- Does not actually send emails
- No delivery tracking or bounce handling
- No unsubscribe list enforcement

**Mock Twilio:**
- Does not actually send SMS
- No delivery status updates
- No rate limiting (real Twilio has 10 msg/sec limit)

**Mock Claude:**
- Returns pre-defined responses (not real AI)
- Limited variety of responses
- No actual token costs or usage

**Mock R2:**
- Files stored in memory only (lost on restart)
- No actual file data stored (only metadata)
- No persistence across deploys

## Tasks Unblocked

These mocks enable immediate development of:
- **Task 7.1** - File upload and quota system
- **Task 8.1** - Email/SMS broadcasts
- **Task 8.4** - AI content generation (Violet)
- **Task 9.1** - AI-powered features

## Questions?

For issues or questions about mock services:
- Check console logs for debugging information
- Verify `USE_MOCKS` environment variable is set
- Ensure mock service matches real service interface
- See task-0.3 in backlog for implementation details
