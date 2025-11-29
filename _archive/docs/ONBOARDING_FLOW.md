# Onboarding Flow Documentation

**Last Updated:** 2025-11-21
**Status:** ✅ Complete (All 5 steps implemented)

---

## Overview

The Umbrella artist onboarding is a 5-step guided process that collects all necessary profile information before granting access to the main application. New users must complete all 5 steps before accessing the dashboard, marketplace, and other features.

---

## Step Breakdown

### Step 1: Identity & Basics
**Route:** `/onboarding/artists/step1`
**API Endpoint:** `POST /v1/onboarding/artists/step1`
**Component:** `src/pages/onboarding/Step1.tsx`

**Purpose:** Collect fundamental artist identity information

**Fields (All Required):**
- `stage_name` (string) - Artist or band name
- `location_city` (string) - City location
- `location_state` (string) - State location
- `contact_phone` (string, optional) - Phone number
- `inspirations` (string, optional) - Artist inspirations (one per line)
- `genre_primary` (string[], optional) - Primary genres

**Validation:**
- Stage name: 1-100 characters
- Location city/state: Required
- Phone: Valid format if provided

**Next Step:** Redirects to Step 2 on success

---

### Step 2: Links & Story
**Route:** `/onboarding/artists/step2`
**API Endpoint:** `POST /v1/onboarding/artists/step2`
**Component:** `src/pages/onboarding/Step2.tsx`

**Purpose:** Collect social media links and artist narrative

**Fields:**
- **Social Links (Minimum 3 required):**
  - `instagram_handle` (string) - Instagram username (no @)
  - `tiktok_handle` (string) - TikTok username (no @)
  - `youtube_url` (string) - YouTube channel URL
  - `spotify_url` (string) - Spotify artist URL
  - `apple_music_url` (string) - Apple Music URL
  - `soundcloud_url` (string) - SoundCloud URL
  - `facebook_url` (string) - Facebook page URL
  - `twitter_url` (string) - Twitter/X profile URL
  - `bandcamp_url` (string) - Bandcamp URL
  - `website_url` (string) - Personal website URL

- **Story Fields (Optional):**
  - `bio` (string, max 500 chars) - Short bio
  - `story` (string, max 2000 chars) - Full artist story
  - `tagline` (string, max 100 chars) - Catchy tagline
  - `tasks_outsource` (string, max 500 chars) - Tasks to outsource
  - `sound_uniqueness` (string, max 500 chars) - What makes sound unique
  - `dream_venue` (string, max 200 chars) - Dream performance venue
  - `biggest_inspiration` (string, max 200 chars) - Biggest inspiration
  - `favorite_create_time` (string, max 200 chars) - Best time to create
  - `platform_pain_point` (string, max 500 chars) - Platform pain points

**Validation:**
- At least 3 social media links required
- All URLs must be valid format
- Instagram/TikTok handles: alphanumeric + dots/underscores only
- Character limits enforced on text fields

**Next Step:** Redirects to Step 3 on success

---

### Step 3: Creative Profile
**Route:** `/onboarding/artists/step3`
**API Endpoint:** `POST /v1/onboarding/artists/step3`
**Component:** `src/pages/onboarding/Step3.tsx`

**Purpose:** Collect creative tags and equipment information

**Fields (Multi-select):**
- `artist_types` (string[]) - Solo, band, duo, DJ, producer, etc.
- `genres` (string[]) - Music genres
- `moods` (string[]) - Music moods (energetic, chill, etc.)
- `performance_types` (string[]) - Live, DJ set, acoustic, etc.
- `equipment_instruments` (string[]) - Instruments played
- `equipment_daw` (string[]) - Digital Audio Workstations used
- `equipment_platforms` (string[]) - Streaming platforms
- `influences` (string, optional) - Musical influences (newline-separated)

**Validation:**
- At least 1 selection required in each category
- Tags must be from predefined lists (see `api/constants/creative-profile.ts`)
- Influences: Free text, one per line

**Next Step:** Redirects to Step 4 on success

---

### Step 4: Your Numbers
**Route:** `/onboarding/artists/step4`
**API Endpoint:** `POST /v1/onboarding/artists/step4`
**Component:** `src/pages/onboarding/Step4.tsx`

**Purpose:** Collect rates, capacity, and availability information

**Fields:**
- `base_rate_flat` (number, optional) - Flat rate for performances ($)
- `base_rate_hourly` (number, optional) - Hourly rate ($)
- `largest_show_capacity` (number, optional) - Largest show capacity
- `travel_radius_miles` (number, optional) - Willing to travel (miles)
- `advance_booking_weeks` (number, optional) - Advance booking time (weeks)
- `time_split_creative` (number) - % of time spent on creative work
- `time_split_logistics` (number) - % of time spent on logistics
- `available_dates` (string[]) - Available dates (ISO format: YYYY-MM-DD)

**Validation:**
- At least one rate (flat or hourly) must be provided
- Rates must be positive numbers
- Flat rate max: $1,000,000
- Hourly rate max: $10,000
- Travel radius max: 10,000 miles
- Advance booking max: 52 weeks
- Time splits must add up to 100%
- Dates must be in valid ISO format

**Next Step:** Redirects to Step 5 on success

---

### Step 5: Quick Questions
**Route:** `/onboarding/artists/step5`
**API Endpoint:** `POST /v1/onboarding/artists/step5`
**Component:** `src/pages/onboarding/Step5.tsx` ✨ **NEW**

**Purpose:** Collect quick assessment questions (all optional)

**Fields (All Optional Booleans):**
- `currently_making_music` (boolean) - Actively creating music?
- `confident_online_presence` (boolean) - Happy with online presence?
- `struggles_creative_niche` (boolean) - Unsure about creative niche?
- `knows_where_find_gigs` (boolean) - Know where to find gigs?
- `paid_fairly_performing` (boolean) - Satisfied with performance pay?
- `understands_royalties` (boolean) - Understand how royalties work?

**Validation:**
- All fields are optional
- If provided, must be boolean values

**Special Behavior:**
- **This is the final step** - creates the artist profile in D1 database
- On success: Sets `user.onboarding_complete = true`
- Clears KV session data
- **Redirects to `/dashboard`** (onboarding complete!)

---

## Data Flow

```
User Signs Up (Clerk OAuth)
        ↓
   Login Success
        ↓
   Check onboarding_complete
        ↓
   [false] → Redirect to /onboarding/artists/step1
        ↓
   Step 1 Submit
        ↓
   Data → KV Session (temporary storage)
   completedSteps: [1]
        ↓
   Step 2 Submit
        ↓
   Data → KV Session
   completedSteps: [1, 2]
        ↓
   Step 3 Submit
        ↓
   Data → KV Session
   completedSteps: [1, 2, 3]
        ↓
   Step 4 Submit
        ↓
   Data → KV Session
   completedSteps: [1, 2, 3, 4]
        ↓
   Step 5 Submit (FINAL)
        ↓
   Consolidate all session data
        ↓
   Create artist profile in D1
   Set user.onboarding_complete = true
        ↓
   Clear KV session
        ↓
   Redirect to /dashboard
        ↓
   OnboardingGuard allows access
```

---

## Session Management

**Storage:** Cloudflare KV (temporary)
**Key Pattern:** `onboarding:{userId}`
**TTL:** 7 days

**Session Structure:**
```typescript
interface OnboardingSession {
  userId: string
  currentStep: number  // 1-5
  completedSteps: number[]  // e.g., [1, 2, 3]
  data: {
    step1?: Step1Data
    step2?: Step2Data
    step3?: Step3Data
    step4?: Step4Data
    step5?: Step5Data
  }
  createdAt: string  // ISO timestamp
  updatedAt: string  // ISO timestamp
}
```

**Why KV Session?**
- Allows users to pause and resume onboarding
- Prevents data loss if browser closes
- Can go back to previous steps
- Data only committed to D1 on final step completion

---

## Navigation & Guards

### OnboardingGuard
**File:** `src/components/auth/OnboardingGuard.tsx`

**Purpose:** Prevents access to main app features until onboarding complete

**Behavior:**
- Checks `user.onboarding_complete` flag
- If `false`: Redirects to `/onboarding/artists/step1`
- If `true`: Allows access to protected routes

**Applied To:**
- `/dashboard`
- `/marketplace/*`
- `/messages`
- `/files`
- `/violet`
- `/profile/*`
- `/settings`
- All other main app routes

### Navigation Flow
- **Back Button:** Each step (2-5) has a "Back" button to previous step
- **Progress Indicator:** Shows "Step X of 5" and progress bar (0%, 20%, 40%, 60%, 80%, 100%)
- **Skip:** Not allowed - all steps must be visited (but many fields are optional)
- **Direct URL Access:** Allowed - users can bookmark and return to any step

---

## API Contracts

### Request Format
All onboarding steps use:
- **Method:** POST
- **Content-Type:** application/json
- **Auth:** Required (Bearer token from Clerk)

### Response Format
**Success (200):**
```json
{
  "message": "Step X completed",
  "step_completed": X,
  "nextStep": X+1,
  "completedSteps": [1, 2, ..., X]
}
```

**Final Step (Step 5) Success:**
```json
{
  "message": "Onboarding complete",
  "artist": {
    "id": "artist_xxx",
    "user_id": "user_xxx",
    "stage_name": "..."
    // ... full artist profile
  },
  "redirect_url": "/dashboard"
}
```

**Error (400/500):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field_name": "Error message"
    }
  }
}
```

---

## Frontend Components

### Common Pattern
All step components follow this structure:

```tsx
export default function OnboardingStepX() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<StepXFormData>({
    defaultValues: { /* ... */ }
  })

  const onSubmit = async (data: StepXFormData) => {
    setError(null)
    setIsLoading(true)

    try {
      await apiClient.submitOnboardingStepX(data)
      navigate('/onboarding/artists/stepX+1')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br...">
      {/* Progress Indicator */}
      {/* Form Card */}
      {/* Error Alert */}
      {/* Navigation Buttons */}
    </div>
  )
}
```

### Shared UI Elements
- **Progress Bar:** Purple gradient, shows % complete
- **Card Container:** Consistent padding and styling
- **Form Fields:** Using shadcn/ui components (Input, Checkbox, Select, etc.)
- **Error Alerts:** Red alert with icon
- **Submit Button:** Purple primary button with loading state
- **Back Button:** Outline style, navigates to previous step

---

## Testing

### Manual Test Plan

**Prerequisites:**
1. Start dev servers:
   ```bash
   npm run dev              # Frontend (port 5173)
   npm run dev:worker       # Backend Worker (port 8787)
   ```

2. Clear browser session:
   - Open DevTools
   - Clear localStorage
   - Clear cookies

**Test Steps:**

1. **Navigate to Step 1**
   - Go to: `http://localhost:5173/onboarding/artists/step1`
   - ✓ Verify form renders correctly
   - ✓ Fill in all required fields
   - ✓ Click "Next"
   - ✓ Verify navigation to Step 2

2. **Complete Step 2**
   - ✓ Verify form renders with social links
   - ✓ Add at least 3 social links
   - ✓ Fill in optional story fields
   - ✓ Click "Next"
   - ✓ Verify navigation to Step 3

3. **Complete Step 3**
   - ✓ Verify creative tags render
   - ✓ Select at least 1 tag per category
   - ✓ Click "Next"
   - ✓ Verify navigation to Step 4

4. **Complete Step 4** (NEWLY WIRED)
   - ✓ Verify rates and availability form renders
   - ✓ Enter at least one rate (flat or hourly)
   - ✓ Adjust time split slider
   - ✓ Click "Next"
   - ✓ Verify navigation to Step 5

5. **Complete Step 5** (NEW COMPONENT)
   - ✓ Verify 6 questions render as checkboxes
   - ✓ Check some questions (optional)
   - ✓ Click "Complete Onboarding"
   - ✓ Verify navigation to `/dashboard`
   - ✓ Verify onboarding complete flag set

6. **Verify Dashboard Access**
   - ✓ Check user sees dashboard (not redirected back)
   - ✓ Verify OnboardingGuard allows access
   - ✓ Check profile shows onboarding completed

### Test Matrix

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Submit Step 1 with invalid data | Validation errors shown | ⬜ |
| Navigate back from Step 3 to Step 2 | Previous data preserved | ⬜ |
| Skip required fields in Step 2 | Form submission prevented | ⬜ |
| Submit Step 4 with valid rates | Navigate to Step 5 | ⬜ |
| Submit Step 5 with all questions unchecked | Navigate to dashboard | ⬜ |
| Try to access dashboard mid-onboarding | Redirected back to current step | ⬜ |
| Complete all 5 steps | Dashboard accessible, flag set | ⬜ |
| Refresh browser on Step 3 | Session persists, can continue | ⬜ |
| Close browser and return | Session persists for 7 days | ⬜ |

---

## Troubleshooting

### Issue: User stuck on a step

**Diagnosis:**
```bash
# Check KV session
curl http://localhost:8787/v1/onboarding/status \
  -H "Authorization: Bearer {token}"
```

**Solution:**
```bash
# Reset session
curl -X POST http://localhost:8787/v1/onboarding/reset \
  -H "Authorization: Bearer {token}"
```

### Issue: Data not persisting

**Possible Causes:**
1. KV binding not configured in wrangler.toml
2. KV namespace ID incorrect
3. Session TTL expired (>7 days)

**Check:**
```bash
wrangler kv:namespace list
wrangler kv:key get "onboarding:{userId}" --namespace-id={KV_ID}
```

### Issue: Validation errors

**Check:**
- `api/utils/validation.ts` for validation rules
- Ensure frontend form matches API contract
- Check network tab for actual API request/response

### Issue: Step 4 or Step 5 not working

**Verify:**
- Step4.tsx is imported in routes/index.tsx ✅
- Step5.tsx is imported in routes/index.tsx ✅
- PlaceholderPage replaced with Step4/Step5 ✅
- API methods exist in api-client.ts ✅
- TypeScript compilation succeeds ✅

---

## Files Modified (Phase 1)

### New Files Created:
- ✅ `src/pages/onboarding/Step5.tsx` - Quick Questions component

### Files Modified:
- ✅ `src/routes/index.tsx` - Added Step4 and Step5 imports and routes
- ✅ `src/pages/onboarding/Step4.tsx` - Fixed API field names (flat_rate → base_rate_flat)
- ✅ `src/lib/api-client.ts` - Added submitOnboardingStep5(), fixed Step4 interface

### Files Verified:
- ✅ `src/pages/onboarding/Step1.tsx` - Already implemented
- ✅ `src/pages/onboarding/Step2.tsx` - Already implemented
- ✅ `src/pages/onboarding/Step3.tsx` - Already implemented
- ✅ `src/pages/onboarding/Step4.tsx` - Existed, now wired up + bug fixed
- ✅ `api/controllers/onboarding/index.ts` - All 5 endpoints implemented
- ✅ `api/utils/validation.ts` - All 5 validators implemented

---

## Backend Implementation

### API Routes
**File:** `api/index.ts`

```typescript
// Onboarding routes
router.post('/v1/onboarding/artists/step1', onboardingController.submitArtistStep1, [authMiddleware])
router.post('/v1/onboarding/artists/step2', onboardingController.submitArtistStep2, [authMiddleware])
router.post('/v1/onboarding/artists/step3', onboardingController.submitArtistStep3, [authMiddleware])
router.post('/v1/onboarding/artists/step4', onboardingController.submitArtistStep4, [authMiddleware])
router.post('/v1/onboarding/artists/step5', onboardingController.submitArtistStep5, [authMiddleware])
router.get('/v1/onboarding/status', onboardingController.getOnboardingStatus, [authMiddleware])
router.post('/v1/onboarding/reset', onboardingController.resetOnboarding, [authMiddleware])
```

### Controller Functions
**File:** `api/controllers/onboarding/index.ts`

All 5 step submission handlers are implemented:
- `submitArtistStep1()` - Validates and saves to KV
- `submitArtistStep2()` - Validates and saves to KV
- `submitArtistStep3()` - Validates and saves to KV
- `submitArtistStep4()` - Validates and saves to KV
- `submitArtistStep5()` - **Final step**: Validates, creates D1 profile, sets onboarding_complete flag

### Database Schema
**File:** `db/migrations/0001_users_artists.sql`

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  onboarding_complete BOOLEAN DEFAULT 0,  -- Flag checked by OnboardingGuard
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  stage_name TEXT NOT NULL,
  -- ... 40+ fields populated from onboarding steps
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Summary

**Status:** ✅ **All 5 onboarding steps complete and functional**

**Completed in Phase 1:**
1. ✅ Wired up Step4 component to routes
2. ✅ Verified Step4 implementation and fixed API contract bug
3. ✅ Created Step5 component from scratch
4. ✅ Added Step5 API method to client
5. ✅ Wired up Step5 to routes
6. ✅ Verified TypeScript compilation (0 errors)
7. ✅ Verified build succeeds
8. ✅ Documented complete onboarding flow

**Ready for Manual Testing:** Yes
**Blocking Issues:** None
**Next Steps:** Manual end-to-end testing (Task 1.5)

---

**Documentation maintained by:** Claude Code
**Last validation:** 2025-11-21
**Version:** 1.0
