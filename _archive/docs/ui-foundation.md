# UI Foundation & Component Library

## Completed
- [x] 90+ shadcn/ui components copied
- [x] Layout components (AppLayout, PageHeader, PageLayout)
- [x] Theme system (light/dark mode)
- [x] Toast notifications
- [x] Error boundaries
- [x] Custom hooks (toast, theme, local storage, mobile, auth, api)
- [x] Utility functions (cn, API client)
- [x] React app shell
- [x] Index.css with Tailwind setup

## Component Library Inventory

### Core UI Components
All components are located in `src/components/ui/`:

- **Buttons & Inputs**: button, input, textarea, label, checkbox, switch, radio-group, slider
- **Forms**: form (with react-hook-form integration)
- **Layout**: card, separator, aspect-ratio, scroll-area, resizable
- **Navigation**: tabs, breadcrumb, navigation-menu, menubar, pagination
- **Overlays**: dialog, alert-dialog, sheet, drawer, popover, hover-card, tooltip
- **Feedback**: alert, toast, toaster, sonner, progress, skeleton
- **Data Display**: table, badge, avatar, calendar, chart, carousel
- **Menus**: dropdown-menu, context-menu, command (command palette)
- **Grouping**: accordion, collapsible, toggle-group, toggle
- **Advanced**: sidebar, input-otp, select

### Layout Components
Located in `src/components/layout/`:

- **AppLayout.tsx** - Main application shell
- **PageHeader.tsx** - Page titles and breadcrumbs
- **PageLayout.tsx** - Consistent page structure

### Theme Components
Located in `src/components/`:

- **theme-provider.tsx** - Context provider for theme management
- **theme-toggle.tsx** - Light/dark mode toggle button
- **ErrorBoundary.tsx** - React error boundary for graceful error handling

### Custom Hooks
Located in `src/hooks/`:

- **useToast()** - Toast notification system
- **useTheme()** - Access and control theme (light/dark)
- **useLocalStorage()** - Persistent state management
- **useMobile()** - Responsive breakpoint detection
- **useAuth()** - Authentication state and session management
  - Returns: user, isAuthenticated, isLoading, logout, setSession, needsOnboarding
- **useApi()** - Generic API request hook with loading/error states
- **useProfile()** - Fetch user profile
- **useUpdateProfile()** - Update user profile
- **useGigs()** - Fetch marketplace gigs (stub)
- **useArtists()** - Fetch marketplace artists (stub)
- **useConversations()** - Fetch conversations (stub)
- **useMessages()** - Fetch messages (stub)

### Utility Functions
Located in `src/lib/`:

- **utils.ts** - Contains the famous `cn()` function for merging Tailwind classes
- **api-client.ts** - API client singleton with endpoints:
  - Auth: /v1/auth/callback, /v1/auth/session, /v1/auth/logout
  - Profile: /v1/profile (GET, PUT)
  - Marketplace: /v1/gigs, /v1/artists (stubs)
  - Messaging: /v1/conversations (stubs)

## React App Structure

```
src/
├── App.tsx           # Root app component
├── main.tsx          # React entry point
├── index.css         # Tailwind + CSS variables
├── components/
│   ├── ui/           # 90+ shadcn components
│   ├── layout/       # AppLayout, PageHeader, PageLayout
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── ErrorBoundary.tsx
├── hooks/
│   ├── use-toast.ts
│   ├── use-theme.ts
│   ├── use-local-storage.ts
│   ├── use-mobile.tsx
│   ├── use-auth.ts
│   └── use-api.ts
└── lib/
    ├── utils.ts
    └── api-client.ts
```

## Next Steps (Future Sessions)

1. **Build domain-specific components:**
   - ArtistCard, GigCard (marketplace display)
   - ProfileTabs (6-tab artist profile)
   - MessageThread (messaging interface)
   - VioletPromptInterface (AI toolkit)
   - OnboardingFlow (6-step onboarding)

2. **Add routing with React Router:**
   - / - Landing page
   - /dashboard - User dashboard
   - /marketplace - Browse gigs and artists
   - /profile/:id - Artist profile view
   - /messages - Messaging interface
   - /onboarding - Onboarding flow

3. **Build page layouts:**
   - Dashboard (metrics, recent activity)
   - Marketplace (filters, search, cards)
   - Messages (conversation list + thread view)
   - Profile (6-tab layout with all artist info)
   - Onboarding (6-step wizard)

4. **Integrate with backend API:**
   - Connect auth hooks to /v1/auth endpoints
   - Implement profile management
   - Build marketplace filtering and search
   - Add real-time messaging
   - Integrate Violet AI prompts

## Usage Examples

### Using Components

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

function MyComponent() {
  const { toast } = useToast()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello Umbrella</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => toast({ title: "Success!" })}>
          Click me
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Using Auth Hook

```tsx
import { useAuth } from '@/hooks/use-auth'

function ProfileButton() {
  const { user, isAuthenticated, logout, needsOnboarding } = useAuth()

  if (!isAuthenticated) {
    return <Button>Sign In</Button>
  }

  if (needsOnboarding) {
    return <Button onClick={() => navigate('/onboarding')}>
      Complete Setup
    </Button>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {user.email}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={logout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Using API Hooks

```tsx
import { useProfile, useUpdateProfile } from '@/hooks/use-api'

function ProfileEditor() {
  const { data: profile, loading, error } = useProfile()
  const { updateProfile, loading: saving } = useUpdateProfile()

  if (loading) return <Skeleton className="h-20" />
  if (error) return <Alert variant="destructive">{error}</Alert>

  const handleSave = async (data: any) => {
    await updateProfile(data)
    toast({ title: "Profile updated!" })
  }

  return <Form onSubmit={handleSave}>{/* form fields */}</Form>
}
```

## Testing

```bash
# Run dev server (after package.json is set up in Session 4)
npm run dev

# Should see:
# - "Umbrella MVP" heading
# - No console errors
# - Tailwind styles applied
# - Theme system functional (when theme toggle is added to UI)
```

## Architecture Notes

- **All components use Tailwind CSS** for styling
- **Theme system uses CSS variables** (see index.css)
- **Components are fully typed** with TypeScript
- **Follows shadcn/ui conventions** for consistent API
- **Authentication uses Cloudflare Access** OAuth (Apple/Google)
- **Session tokens stored in localStorage** with expiry checking
- **Onboarding status checked** via needsOnboarding flag
- **API client handles** auth headers, error handling, session expiry

## Design System

### Colors
CSS variables in `index.css` define the entire color palette:
- `background`, `foreground` - Main app colors
- `primary`, `secondary`, `muted`, `accent` - UI element colors
- `destructive` - Error/danger states
- `border`, `input`, `ring` - Form element colors
- `chart-1` through `chart-5` - Chart/data visualization colors

### Typography
Uses Tailwind's built-in typography scale. Font imports will be added in Session 4 via package.json.

### Spacing
Uses Tailwind's spacing scale (rem-based).

### Radius
Default border radius: `--radius: 0.5rem`

## Known Limitations & Future Work

1. **No routing yet** - React Router will be added when building pages
2. **No form validation library** - Will add zod + react-hook-form
3. **API endpoints are stubs** - Backend API (Session 1) will implement these
4. **No testing setup** - Vitest will be added in future
5. **No Storybook** - Component development environment TBD
6. **Theme toggle not in UI** - Need to add to AppLayout in future
7. **No 404/error pages** - Will add with routing
8. **No loading states** - Need to add skeleton screens to pages

## Dependencies Required (Session 4 will add these)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@radix-ui/react-*": "latest",
    "lucide-react": "^0.263.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "sonner": "^1.0.0"
  }
}
```

## File Boundaries

Session 2 created files in:
- ✅ `src/*` (all frontend code)
- ✅ `index.html` (app entry point)
- ✅ `/docs/ui-foundation.md` (this file)

Did NOT create files in:
- ❌ `api/*` (Session 1 - Backend API)
- ❌ `db/*` (Session 3 - Database)
- ❌ `.github/*` (Session 4 - DevOps)
- ❌ Root config files (Session 4 - Build tools)

## Success Criteria

- [x] Can import and use all UI components without errors
- [x] Theme system compiles and types are correct
- [x] All hooks compile without TypeScript errors
- [x] App shell (App.tsx, main.tsx) is ready for routing
- [x] index.html references correct entry point
- [x] Documentation is complete and accurate
- [ ] `npm run dev` works (requires Session 4 config)
- [ ] No TypeScript errors (requires Session 4 config)
