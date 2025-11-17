# Error Message Style Guide

**Last Updated:** 2025-11-17
**Version:** 1.0

## Purpose
This guide establishes standards for all user-facing error messages in the application. The goal is to create error messages that are clear, helpful, and actionable.

---

## Core Principles

### 1. Be Specific
Tell users exactly what went wrong, not just that something failed.

**Bad:** "An error occurred"
**Good:** "Your file is too large to upload"

### 2. Be Human
Use plain language, avoid technical jargon and error codes in the primary message.

**Bad:** "ERR_FOREIGN_KEY_CONSTRAINT: 23503"
**Good:** "This item is being used and cannot be deleted"

### 3. Be Helpful
Suggest what the user can do next. Every error should include an action.

**Bad:** "Invalid email format"
**Good:** "Please enter a valid email address (example: you@example.com)"

### 4. Be Honest
If it's our fault, own it. Don't blame the user for system issues.

**Bad:** "You caused a server error"
**Good:** "Something went wrong on our end. Please try again"

---

## Error Message Structure

All errors should follow this structure:

```typescript
{
  title: string,       // Short, descriptive title (e.g., "Upload Failed")
  message: string,     // Clear explanation of what went wrong
  action: string,      // What the user should do next
  code?: string        // Technical code for support (optional, not shown to user)
}
```

### Example

```typescript
{
  title: "Upload Failed",
  message: "Your file is too large",
  action: "Please choose a file under 50 MB",
  code: "FILE_TOO_LARGE"
}
```

---

## Error Categories & Patterns

### 1. Validation Errors
**When:** User input doesn't meet requirements
**Tone:** Instructive, helpful
**Pattern:** "[Field] is [issue]. [How to fix it]"

#### Examples

| Bad | Good |
|-----|------|
| "Invalid" | "Email is required. Please enter your email address" |
| "Wrong format" | "Website URL must start with http:// or https://" |
| "Field error" | "Bio must be 500 characters or less. Currently: 612 characters" |
| "Required" | "Please select at least one music genre" |

#### Template
```
[Field name] [is/must be] [requirement]. [Helpful guidance]
```

---

### 2. Authentication Errors
**When:** Login, session, or permission issues
**Tone:** Polite, security-conscious
**Pattern:** "[What happened]. [What to do]"

#### Examples

| Error Type | Message | Action |
|------------|---------|--------|
| Session expired | "Your session has expired" | "Please log in again to continue" |
| Invalid credentials | "Email or password is incorrect" | "Please check your credentials and try again" |
| Account locked | "Your account has been temporarily locked" | "Please try again in 15 minutes or reset your password" |
| Email not verified | "Please verify your email address" | "Check your inbox for a verification link" |
| No permission | "You don't have permission to access this" | "Contact support if you believe this is a mistake" |

---

### 3. Authorization Errors
**When:** User doesn't have permission
**Tone:** Respectful, explanatory
**Pattern:** "You don't have permission to [action]. [Reason/next steps]"

#### Examples

| Scenario | Message |
|----------|---------|
| Read-only access | "You don't have permission to edit this content. Contact the owner to request access" |
| Feature not available | "This feature is only available on Pro plans. Upgrade your account to access it" |
| Role restriction | "Only administrators can delete users. Contact your admin for help" |
| Ownership | "You can only edit your own profile. You're currently viewing another user's profile" |

---

### 4. Server Errors (5xx)
**When:** Backend/infrastructure failures
**Tone:** Apologetic, reassuring
**Pattern:** "Something went wrong. [What to try]"

#### Examples

| Status | Message | Action |
|--------|---------|--------|
| 500 | "Something went wrong on our end" | "Please try again. If this continues, contact support" |
| 502 | "We're experiencing connection issues" | "Please wait a moment and try again" |
| 503 | "We're temporarily down for maintenance" | "We'll be back shortly. Thank you for your patience" |
| 504 | "The request took too long to complete" | "Please try again with a smaller file or simpler request" |

**Important:** Never expose stack traces or internal error details to users.

---

### 5. Network Errors
**When:** Connection problems
**Tone:** Practical, diagnostic
**Pattern:** "Unable to connect. [Possible cause] [How to fix]"

#### Examples

| Scenario | Message |
|----------|---------|
| Offline | "You're offline. Please check your internet connection and try again" |
| Timeout | "The connection timed out. Please check your internet and try again" |
| DNS failure | "Unable to connect to the server. Please check your internet connection" |
| CORS error | "Unable to load this content. Please refresh the page" |

---

### 6. Resource Errors (404, 410)
**When:** Content not found
**Tone:** Informative, helpful
**Pattern:** "[Resource] not found. [Why/what to do]"

#### Examples

| Scenario | Message |
|----------|---------|
| 404 | "This page doesn't exist. It may have been moved or deleted" |
| Deleted content | "This content has been removed by the owner" |
| Invalid ID | "We couldn't find what you're looking for. Please check the link and try again" |

---

### 7. Rate Limiting (429)
**When:** Too many requests
**Tone:** Explanatory, patient
**Pattern:** "Too many requests. [When to try again]"

#### Examples

| Context | Message |
|---------|---------|
| API rate limit | "You've made too many requests. Please wait a moment and try again" |
| Login attempts | "Too many login attempts. Please wait 15 minutes before trying again" |
| AI usage | "You've reached your daily limit for AI requests. Your limit resets tomorrow" |

---

### 8. File Upload Errors
**When:** File upload issues
**Tone:** Specific, helpful
**Pattern:** "[Issue with file]. [Requirement/solution]"

#### Examples

| Issue | Message | Action |
|-------|---------|--------|
| Too large | "File is too large" | "Please choose a file under 50 MB" |
| Wrong type | "This file type is not supported" | "Please upload a JPG, PNG, or PDF file" |
| Virus detected | "This file may contain harmful content" | "Please scan your file and try a different one" |
| Corrupted | "This file appears to be damaged" | "Please try uploading a different file" |
| No space | "You don't have enough storage space" | "Delete some files or upgrade your plan" |

---

### 9. Payment Errors
**When:** Billing/payment issues
**Tone:** Professional, reassuring
**Pattern:** "[What happened]. [How to fix]"

#### Examples

| Issue | Message | Action |
|-------|---------|--------|
| Card declined | "Your payment was declined" | "Please check your card details or try a different payment method" |
| Insufficient funds | "Payment failed due to insufficient funds" | "Please check your balance or use a different card" |
| Expired card | "Your card has expired" | "Please update your payment method in settings" |
| Network error | "We couldn't process your payment" | "Please try again or contact your bank if this continues" |

---

### 10. Database/Data Errors
**When:** Data integrity issues
**Tone:** User-friendly, never technical
**Pattern:** "[User-facing consequence]. [What to try]"

#### User-Friendly Translations

| Technical Error | User Message |
|-----------------|--------------|
| Foreign key constraint | "This item is being used and cannot be deleted. Please remove its dependencies first" |
| Unique constraint | "An item with this name already exists. Please choose a different name" |
| Not null constraint | "All required fields must be filled in. Please complete the form" |
| Data too long | "This text is too long. Please shorten it to 500 characters or less" |

---

## Tone Guidelines by Context

### Critical Errors (Data loss, security)
- **Tone:** Direct, urgent, protective
- **Example:** "Your session has expired for security. Please log in again"

### Recoverable Errors (Validation, temporary failures)
- **Tone:** Helpful, encouraging
- **Example:** "We couldn't save your changes. Please try again"

### User Errors (Wrong input, missing fields)
- **Tone:** Instructive, patient
- **Example:** "Please enter a valid email address"

### System Errors (Our fault)
- **Tone:** Apologetic, transparent
- **Example:** "We're sorry, something went wrong on our end"

---

## Display Patterns

### Toast Notifications
**Use for:**
- Success confirmations
- Minor errors that don't block workflow
- Background operation status

**Duration:**
- Success: 3 seconds
- Error: 5 seconds
- Warning: 4 seconds

**Pattern:**
```typescript
toast.error('Upload failed. File is too large (max 50 MB)')
toast.success('Profile updated successfully')
toast.warning('You have 3 AI requests remaining today')
```

### Inline Errors (Forms)
**Use for:**
- Field validation errors
- Real-time input feedback

**Pattern:**
```tsx
<Input error="Email is required" />
<span className="text-destructive text-sm">
  Password must be at least 8 characters
</span>
```

### Modal/Alert Errors
**Use for:**
- Critical errors
- Errors requiring acknowledgment
- Multiple errors at once

**Pattern:**
```tsx
<Alert variant="destructive">
  <AlertTitle>Unable to Delete Account</AlertTitle>
  <AlertDescription>
    You have active subscriptions. Please cancel them first.
  </AlertDescription>
</Alert>
```

### Error Pages
**Use for:**
- 404, 500 errors
- Complete page failures
- Unauthorized access

**Include:**
- Clear headline
- Explanation
- Next steps
- Link to home or support

---

## Special Cases

### Multiple Errors
When multiple errors occur:
1. Group related errors
2. Prioritize by severity
3. Show max 3-5 at once

**Example:**
```
Profile Update Failed

• Email is required
• Phone number format is invalid
• Bio is too long (612/500 characters)

Please fix these issues and try again.
```

### Silent Errors
Some errors should be logged but not shown:
- Background sync failures (retry automatically)
- Analytics tracking failures
- Non-critical API errors

### Progressive Disclosure
Start simple, offer details on request:

```
Primary: "Something went wrong. Please try again"
[Show Details] → "Error Code: AUTH_001. Contact support with this code"
```

---

## Checklist for Every Error Message

Before implementing an error message, verify:

- [ ] Is it specific about what went wrong?
- [ ] Does it use plain language (no jargon)?
- [ ] Does it tell the user what to do next?
- [ ] Is the tone appropriate for the situation?
- [ ] Does it avoid blaming the user unnecessarily?
- [ ] Is it concise (ideally 1-2 sentences)?
- [ ] Does it include error code for support (hidden from UI)?
- [ ] Would you understand this if you saw it?

---

## Anti-Patterns (Never Do This)

### ❌ Generic Messages
```
"Error"
"Something went wrong"
"Invalid input"
```

### ❌ Technical Jargon
```
"Clerk API returned 401 Unauthorized"
"Foreign key constraint violation on user_id"
"CORS policy blocked the request"
```

### ❌ Blaming the User
```
"You entered the wrong password"
"You don't have permission"
"Your file is invalid"
```

### ❌ No Action
```
"Upload failed" (and nothing else)
"Error occurred" (with no next steps)
```

### ❌ ALL CAPS
```
"ERROR: FILE TOO LARGE"
```

### ❌ Overly Apologetic
```
"We're so sorry! We sincerely apologize for this terrible, horrible error!"
```

---

## Testing Error Messages

### User Testing
1. Show error to someone unfamiliar with the system
2. Ask: "What went wrong?" and "What would you do?"
3. If they can't answer, revise the message

### Slow Connection Testing
1. Throttle network to Slow 3G
2. Trigger all async errors
3. Verify error messages are clear and actionable

### Edge Cases
- Test with non-technical users
- Test in production-like scenarios
- Test with screen readers (accessibility)

---

## Migration Strategy

### Existing Error Messages
1. Audit all catch blocks and error handlers
2. Identify technical/unclear messages
3. Replace with user-friendly versions
4. Add error codes for tracking
5. Test with users

### New Features
- All new errors must follow this guide
- Error messages reviewed in code review
- User-test critical error flows

---

## Error Message Constants Location

**Frontend:** `/src/lib/error-messages.ts`
**Backend:** `/api/utils/error-messages.ts`

See these files for the full catalog of standardized error messages.

---

## Support & Questions

When in doubt:
1. Be clear and specific
2. Suggest a solution
3. Test with a real user

**Remember:** Error messages are often a user's first interaction with support. Make them count.
