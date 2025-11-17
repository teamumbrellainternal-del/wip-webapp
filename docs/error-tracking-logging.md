# Error Tracking and Logging

This document describes the error tracking and logging implementation for the Umbrella API Worker (task-10.2).

## Overview

The application now includes:
- **Sentry integration** for error tracking and performance monitoring
- **Structured JSON logging** with multiple log levels
- **Automatic sensitive data sanitization**
- **Environment-specific logging configuration**

## Components

### 1. Logger Utility (`api/utils/logger.ts`)

A structured logging system that outputs JSON-formatted logs with the following features:

#### Log Levels
- `debug`: Verbose logging for development (only in dev environment)
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error messages

#### Usage
```typescript
import { logger } from './utils/logger'

// Basic logging
logger.info('User logged in', { userId: '123' })
logger.error('Database query failed', { error, query })

// With context
logger.debug('Processing request', {
  requestId: 'req_123',
  userId: 'user_456',
  endpoint: '/v1/profile',
  parameters: { id: '789' }
})
```

#### Sensitive Data Sanitization
The logger automatically redacts sensitive fields:
- Passwords
- Tokens (JWT, API keys, auth tokens)
- Authorization headers
- Cookies
- Session data

### 2. Sentry Integration

#### Configuration
Add your Sentry DSN to `wrangler.toml`:

```toml
[vars]
SENTRY_DSN = "https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT"
ENVIRONMENT = "production"  # or "staging", "development"
```

#### Features
- Automatic exception capture for all unhandled errors
- 10% performance monitoring sample rate in production
- User context tracking (set via authentication middleware)
- Custom tags and extra context for errors

#### Error Severity
- Only 5xx errors (server errors) are sent to Sentry for AppError instances
- All unhandled exceptions are sent to Sentry
- Client errors (4xx) are logged but not sent to Sentry to reduce noise

### 3. Error Handler (`api/middleware/error-handler.ts`)

Enhanced error handling middleware that:
- Logs all errors with full context
- Sends appropriate errors to Sentry
- Sanitizes error messages for production
- Returns proper HTTP error responses

### 4. Request Logger (`api/middleware/logger.ts`)

Logs all API requests with:
- Request ID for tracing
- HTTP method and endpoint
- Query parameters and route parameters
- Response status code
- Request duration (timing)
- User ID (if authenticated)
- IP address and User-Agent
- Sanitized headers

## Environment-Specific Logging

### Development
- All log levels enabled (debug, info, warn, error)
- Verbose output to console
- Full error details including stack traces

### Production
- Error-level only logging
- Minimal console output
- Sanitized error messages (no internal details exposed)
- Full errors sent to Sentry

## Log Format

All logs are output in JSON format for easy parsing:

```json
{
  "timestamp": "2025-11-17T10:30:45.123Z",
  "level": "error",
  "message": "Database query failed",
  "environment": "production",
  "context": {
    "requestId": "req_123456",
    "userId": "user_789",
    "endpoint": "/v1/profile",
    "method": "GET",
    "statusCode": 500,
    "duration": 45,
    "error": "Connection timeout"
  }
}
```

## Testing

To test error tracking:

1. **Local Development**: Run the Worker locally with wrangler dev
2. **Trigger an error**: Make a request to an endpoint that throws an error
3. **Check logs**: Logs will appear in console in JSON format
4. **Verify Sentry**: If SENTRY_DSN is configured, check your Sentry dashboard

## Best Practices

1. **Use appropriate log levels**:
   - `debug` for detailed debugging info
   - `info` for normal operations
   - `warn` for potentially problematic situations
   - `error` for errors and exceptions

2. **Include context**: Always include relevant context (requestId, userId, etc.)

3. **Avoid logging sensitive data**: The logger sanitizes automatically, but be mindful

4. **Use custom error classes**: Use `AppError` and its subclasses for better error tracking

## Files

- `api/utils/logger.ts` - Logging utility
- `api/middleware/logger.ts` - Request logging middleware
- `api/middleware/error-handler.ts` - Error handling middleware
- `api/index.ts` - Sentry initialization
- `wrangler.toml` - Environment configuration
