---
id: task-1.5
title: "Build Login Page Component"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P0", "auth"]
milestone: "M1 - Authentication & Session Management"
dependencies: []
estimated_hours: 3
---

## Description
Create the login page using Clerk's pre-built `<SignIn>` component with Google OAuth (Apple disabled). Clerk handles the entire OAuth flow, UI, and session management.

## Acceptance Criteria
- [ ] src/pages/LoginPage.tsx component created
- [ ] Uses Clerk's `<SignIn>` component (from `@clerk/nextjs` or `@clerk/remix`)
- [ ] Google OAuth configured as only provider in Clerk dashboard
- [ ] Custom appearance/styling to match Umbrella branding
- [ ] Redirects to `/onboarding/role-selection` after sign-in
- [ ] Auto-redirects to dashboard if already authenticated
- [ ] Responsive layout (mobile + desktop)
- [ ] Error handling managed by Clerk component

## Implementation Plan

### 1. Install Clerk SDK
```bash
npm install @clerk/nextjs
# OR
npm install @clerk/remix
```

### 2. Create Login Page Component

**For Next.js:**
```tsx
import { SignIn } from '@clerk/nextjs'

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
      <div className="max-w-md w-full">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-2xl',
              // Custom styling to match Umbrella branding
            }
          }}
          signUpUrl="/sign-up"
          redirectUrl="/onboarding/role-selection"
        />
      </div>
    </div>
  )
}
```

**For Remix:**
```tsx
import { SignIn } from '@clerk/remix'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
      <div className="max-w-md w-full">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-2xl',
            }
          }}
          signUpUrl="/sign-up"
          redirectUrl="/onboarding/role-selection"
        />
      </div>
    </div>
  )
}
```

### 3. Configure Clerk Dashboard

1. **Go to Clerk Dashboard** → "Social Connections"
2. **Enable:** Google OAuth only
3. **Disable:** Apple, GitHub, Facebook, etc.
4. **Configure Google OAuth:**
   - Scopes: `email`, `profile`
   - Allowed redirect URLs: `https://your-app.com/*`

### 4. Add Clerk Provider to App

**Next.js (`_app.tsx` or `layout.tsx`):**
```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <Component {...pageProps} />
    </ClerkProvider>
  )
}
```

**Remix (`root.tsx`):**
```tsx
import { ClerkApp } from '@clerk/remix'

function App() {
  return (
    // Your app code
  )
}

export default ClerkApp(App)
```

### 5. Environment Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Notes & Comments
**References:**
- docs/initial-spec/eng-spec.md - Screen 1-3 (Authentication)
- Clerk SignIn component docs
- Clerk appearance customization docs
- src/components/ui/button.tsx - UI component (not needed with Clerk)

**Priority:** P0 - Entry point for all users
**File:** src/pages/LoginPage.tsx
**Can Run Parallel With:** All backend auth tasks (1.1-1.4)

**CLERK MIGRATION CHANGES:**
- ❌ **Removed:** Custom "Sign in with Apple" button
- ❌ **Removed:** Custom "Sign in with Google" button
- ❌ **Removed:** Cloudflare Access redirect URLs
- ❌ **Removed:** Custom OAuth error handling
- ✅ **Added:** Clerk `<SignIn>` component
- ✅ **Added:** Google OAuth as only provider
- ✅ **Simplified:** No custom OAuth buttons needed

**Why Use Clerk's Component:**
- Pre-built, accessible UI
- Handles OAuth flow automatically
- Built-in error handling and validation
- Responsive design out of the box
- Customizable appearance via props
- Less code to maintain

**Customization Options:**
```tsx
<SignIn
  appearance={{
    elements: {
      rootBox: 'custom-class',
      card: 'custom-card-class',
      headerTitle: 'text-2xl font-bold',
      headerSubtitle: 'text-gray-600',
      socialButtonsBlockButton: 'bg-white hover:bg-gray-50',
      formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
    },
    layout: {
      socialButtonsPlacement: 'top',
      socialButtonsVariant: 'blockButton',
    }
  }}
  redirectUrl="/onboarding/role-selection"
/>
```

**Redirect Logic:**
After successful sign-in, Clerk redirects to `/onboarding/role-selection`. A middleware or page component then checks onboarding state and redirects appropriately:
- New user → Stay on `/onboarding/role-selection`
- Existing user, incomplete onboarding → `/onboarding/artists/step1`
- Existing user, complete onboarding → `/dashboard`

**Apple OAuth Removal:**
Apple OAuth is disabled per new decision. Only Google OAuth is configured in Clerk dashboard.
