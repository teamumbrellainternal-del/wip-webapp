# TODO Audit & Resolution Plan

**Created:** 2025-11-21
**Phase:** Phase 2 - TODO Comment Resolution
**Total TODOs Found:** 39 (14 frontend + 25 backend)

## Summary

This document categorizes all TODO comments in the codebase by priority and provides resolution plans.

**Priority Levels:**
- **P0 (Critical):** MVP-blocking, must be resolved before launch
- **P1 (High):** Core features, should be resolved for complete MVP
- **P2 (Medium):** Nice-to-have features, can be resolved post-MVP
- **P3 (Low):** Future enhancements, backlog items

---

## P0 - CRITICAL (MVP Blocking) - 3 TODOs

### 1. SearchModal - Navigate to Artist Profile
**File:** `src/components/layout/SearchModal.tsx:122`
**Context:**
```typescript
onClick={() => {
  // TODO: Navigate to artist profile
  console.log('Navigate to artist:', artist.id)
  onOpenChange(false)
}}
```

**Resolution:** Wire up navigation to `/artists/:id` route
**Estimated Time:** 10 minutes
**Blocker:** None - route exists
**Action:** Use `useNavigate()` hook to navigate to artist profile page

---

### 2. SearchModal - Navigate to Gig Details
**File:** `src/components/layout/SearchModal.tsx:162`
**Context:**
```typescript
onClick={() => {
  // TODO: Navigate to gig details
  console.log('Navigate to gig:', gig.id)
  onOpenChange(false)
}}
```

**Resolution:** Wire up navigation to `/gigs/:id` route
**Estimated Time:** 10 minutes
**Blocker:** None - route exists
**Action:** Use `useNavigate()` hook to navigate to gig details page

---

### 3. ProfileDropdown - Implement Logout Logic
**File:** `src/components/layout/ProfileDropdown.tsx:38`
**Context:**
```typescript
const handleLogout = () => {
  // TODO: Implement logout logic when auth flow is complete
  console.log('Logout clicked')
  navigate('/auth')
}
```

**Resolution:** Implement proper logout with Clerk
**Estimated Time:** 20 minutes
**Blocker:** None - Clerk SDK already integrated
**Action:**
1. Import `useClerk` hook
2. Call `clerk.signOut()`
3. Clear local session storage
4. Call `apiClient.logout()`
5. Navigate to auth page

---

## P1 - HIGH PRIORITY (Core Features) - 8 TODOs

### 4. NotificationPanel - Handle Notification Click
**File:** `src/components/layout/NotificationPanel.tsx:101`
**Context:**
```typescript
onClick={() => {
  // TODO: Handle notification click
  console.log('Notification clicked:', notification.id)
  onOpenChange(false)
}}
```

**Resolution:** Navigate based on notification type
**Estimated Time:** 30 minutes
**Action:**
- booking → `/gigs/:gigId`
- message → `/messages/:conversationId`
- profile → `/profile/edit`

---

### 5. NotificationPanel - Mark All as Read
**File:** `src/components/layout/NotificationPanel.tsx:150`
**Context:**
```typescript
onClick={() => {
  // TODO: Mark all as read
  console.log('Mark all as read')
}}
```

**Resolution:** Call API to mark all notifications as read
**Estimated Time:** 20 minutes
**Blocker:** Backend endpoint may need implementation
**Action:** Add `markAllNotificationsAsRead()` to api-client.ts

---

### 6. SearchModal - Implement Actual Search Logic
**File:** `src/components/layout/SearchModal.tsx:48`
**Context:**
```typescript
const handleSearch = (value: string) => {
  setQuery(value)
  // TODO: Implement actual search logic
  if (value.length > 0) {
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 500)
  }
}
```

**Resolution:** Call search API endpoint
**Estimated Time:** 45 minutes
**Blocker:** Backend search endpoint exists (api/controllers/search/)
**Action:**
1. Add `searchArtistsAndGigs(query: string)` to api-client.ts
2. Implement debounced search
3. Replace mock results with real API data

---

### 7. FilesPage - Implement Rename Functionality
**File:** `src/pages/FilesPage.tsx:646`
**Context:**
```typescript
<Button onClick={() => {
  // TODO: Implement rename functionality when API is ready
  setRenameDialogOpen(false)
}}>
  Rename
</Button>
```

**Resolution:** Call API to rename file
**Estimated Time:** 30 minutes
**Blocker:** Backend endpoint may need implementation
**Action:** Add `renameFile(fileId, newName)` to api-client.ts

---

### 8. ProfilePage - Show Toast Notification (Save)
**File:** `src/pages/ProfilePage.tsx:115`
**Context:**
```typescript
onClick={handleSave}
// TODO: Show toast notification
```

**Resolution:** Add toast notification on save success/error
**Estimated Time:** 15 minutes
**Action:** Import and use `useToast()` hook from shadcn/ui

---

### 9. ProfilePage - Implement Report Functionality
**File:** `src/pages/ProfilePage.tsx:119`
**Context:**
```typescript
onClick={() => {
  // TODO: Implement report functionality
}}
```

**Resolution:** Add report modal/dialog
**Estimated Time:** 1 hour
**Action:** Create report dialog with reason selection and submission

---

### 10. ProfileViewPage - Show Toast Notification
**File:** `src/pages/ProfileViewPage.tsx:95`
**Context:**
```typescript
// TODO: Show toast notification
```

**Resolution:** Add toast notification for profile actions
**Estimated Time:** 15 minutes
**Action:** Import and use `useToast()` hook

---

### 11. ProfileViewPage - Record Play Count
**File:** `src/pages/ProfileViewPage.tsx:104`
**Context:**
```typescript
// TODO: Record play count when API is available
```

**Resolution:** Call analytics API when track plays
**Estimated Time:** 20 minutes
**Blocker:** Backend analytics endpoint exists but stubbed
**Action:** Add `trackPlayCount(trackId)` to api-client.ts

---

## P2 - MEDIUM PRIORITY (Nice to Have) - 3 TODOs

### 12. OnboardingGuard - Role Selection Check
**File:** `src/components/auth/OnboardingGuard.tsx:23`
**Context:**
```typescript
// TODO: When user role field is added, check for role selection:
// if (!session.user.role) navigate('/onboarding/role-selection')
```

**Resolution:** Add role selection check when role field is added
**Estimated Time:** 30 minutes
**Status:** Deferred - depends on role field addition
**Action:** Document in backlog

---

### 13. ErrorBoundary - Log to Sentry
**File:** `src/components/ErrorBoundary.tsx:27`
**Context:**
```typescript
// TODO: Log to Sentry or other error tracking service
console.error('Error caught by boundary:', error, errorInfo)
```

**Resolution:** Integrate Sentry for error tracking
**Estimated Time:** 1 hour
**Status:** Post-MVP enhancement
**Action:** Add to backlog for Phase 5 or post-launch

---

### 14. Mock Auth - Replace with Real OAuth
**File:** `src/lib/mock-auth.ts:2`
**Context:**
```typescript
// TODO: Replace with real Cloudflare Access OAuth
```

**Resolution:** N/A - Using Clerk OAuth (already implemented)
**Status:** OBSOLETE - can be removed
**Action:** Verify mock-auth.ts is not used, then delete file

---

## P3 - LOW PRIORITY (Post-MVP Backlog) - 25 Backend TODOs

These are all backend stub implementations for features outside MVP scope:

### Analytics Controller (5 TODOs)
- `api/controllers/analytics/index.ts:225` - Implement profile view analytics
- `api/controllers/analytics/index.ts:251` - Implement gig analytics
- `api/controllers/analytics/index.ts:279` - Implement message analytics
- `api/controllers/analytics/index.ts:307` - Implement Violet usage analytics
- `api/controllers/analytics/index.ts:335` - Implement storage analytics

**Status:** Stub endpoints for future analytics features
**Action:** Document in product backlog

---

### Broadcast Controller (4 TODOs)
- `api/controllers/broadcast/index.ts:34` - Implement broadcast listing
- `api/controllers/broadcast/index.ts:77` - Implement broadcast retrieval
- `api/controllers/broadcast/index.ts:355` - Implement broadcast stats
- `api/controllers/broadcast/index.ts:386` - Implement broadcast deletion

**Status:** Broadcast feature out of MVP scope
**Action:** Document in product backlog

---

### Artists Controller (5 TODOs)
- `api/controllers/artists/index.ts:227` - Implement artist retrieval
- `api/controllers/artists/index.ts:265` - Implement track listing
- `api/controllers/artists/index.ts:292` - Implement review listing
- `api/controllers/artists/index.ts:331` - Implement follow functionality
- `api/controllers/artists/index.ts:359` - Implement unfollow functionality

**Status:** Some endpoints needed for MVP, some post-MVP
**Action:** Evaluate which are MVP critical (artist retrieval, track listing)

---

### Gigs Controller (3 TODOs)
- `api/controllers/gigs/index.ts:297` - Implement gig creation
- `api/controllers/gigs/index.ts:600` - Implement application listing
- `api/controllers/gigs/index.ts:627` - Implement application withdrawal

**Status:** Core marketplace features - may be MVP critical
**Action:** Evaluate priority with product requirements

---

### Files Controller (1 TODO)
- `api/controllers/files/index.ts:574` - Confirm upload and update database

**Status:** File upload confirmation endpoint
**Action:** Evaluate if needed for MVP file management

---

### Violet (AI Assistant) Controller (2 TODOs)
- `api/controllers/violet/index.ts:180` - Implement conversation history retrieval
- `api/controllers/violet/index.ts:316` - Implement history clearing

**Status:** AI assistant features - likely post-MVP
**Action:** Document in product backlog

---

### Search Controller (2 TODOs)
- `api/controllers/search/index.ts:365` - Implement track search
- `api/controllers/search/index.ts:399` - Implement search suggestions/autocomplete

**Status:** Enhanced search features
**Action:** Track search (P2), autocomplete (P3)

---

### Messages Controller (1 TODO)
- `api/controllers/messages/index.ts:992` - Implement conversation deletion (soft delete)

**Status:** Messaging feature enhancement
**Action:** P2 - nice to have for MVP

---

### Utility/Error Handling (2 TODOs)
- `api/utils/clerk-sync.ts:187` - Send alert email/notification to ops team
- `api/index.ts:434` - Send alert email to CTO/admin

**Status:** Operational alerting - production concern
**Action:** P1 for production launch, not dev MVP

---

## Resolution Plan by Phase

### Immediate (This Session)
**Target:** Resolve all P0 TODOs (3 items, ~40 minutes)
1. ✅ SearchModal navigation (2 TODOs)
2. ✅ ProfileDropdown logout (1 TODO)

### Phase 2 Completion
**Target:** Resolve P1 TODOs (8 items, ~4 hours)
- NotificationPanel features (2 TODOs)
- Search implementation (1 TODO)
- File rename (1 TODO)
- Toast notifications (3 TODOs)
- Report functionality (1 TODO)

### Phase 4/5 (Final Polish)
**Target:** Handle P2 TODOs and obsolete cleanup
- Remove obsolete mock-auth.ts
- Document Sentry integration for post-launch

### Post-MVP Backlog
**Target:** Document all P3 backend TODOs
- Create `docs/POST_MVP_BACKLOG.md`
- Categorize by feature area
- Include time estimates and dependencies

---

## Validation Criteria

**Phase 2 Complete When:**
- [ ] All P0 TODOs resolved (3/3)
- [ ] All P1 TODOs resolved (8/8)
- [ ] P2/P3 TODOs documented in backlog
- [ ] Obsolete TODOs removed
- [ ] `grep -r "TODO" src/ | wc -l` shows only documented P2/P3 items
- [ ] Build succeeds with no warnings
- [ ] TypeScript compilation passes

---

## Notes

- **Config TODOs Excluded:** wrangler.toml production IDs (handled in deployment)
- **Documentation TODOs Excluded:** Markdown files are reference only
- **Frontend Focus:** MVP completion focuses on frontend user-facing features
- **Backend Stubs:** Most backend TODOs are intentional stubs for post-MVP features

**Next Action:** Start with P0 TODO resolution (Task 2.2)
