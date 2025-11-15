---
id: task-1.6
title: "Create Authentication React Hooks"
status: "To Do"
assignee: []
created_date: "2025-11-15"
labels: ["frontend", "P0", "auth", "hooks"]
milestone: "M1 - Authentication & Session Management"
dependencies: []
estimated_hours: 2
---

## Description
Create React hooks for managing authentication state across the application, including session checking, login, logout, and user data access.

## Acceptance Criteria
- [ ] useAuth() hook created in src/hooks/use-auth.ts
- [ ] Hook provides: { user, loading, error, checkSession, logout }
- [ ] checkSession() calls GET /v1/auth/session on mount
- [ ] Session data stored in React context
- [ ] logout() calls DELETE /v1/auth/session
- [ ] Auto-redirects to /login if session invalid
- [ ] Integrates with src/contexts/AuthContext.tsx
- [ ] Exports TypeScript types for auth state

## Implementation Plan
1. Create useAuth hook in src/hooks/use-auth.ts
2. Integrate with existing AuthContext
3. Implement checkSession() using apiClient
4. Store user data in context state
5. Implement logout() function
6. Add loading and error states
7. Export hook for use across components

## Notes & Comments
**References:**
- src/contexts/AuthContext.tsx - Existing auth context
- src/lib/api-client.ts - API utilities
- src/hooks/use-api.ts - API hook patterns

**Priority:** P0 - Required by all protected pages
**File:** src/hooks/use-auth.ts
**Can Run Parallel With:** Backend auth tasks
