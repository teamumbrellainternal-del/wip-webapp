# Layout Components

This directory contains layout components for the Umbrella application, providing consistent structure and navigation across all pages.

## AppLayout

Main authenticated app shell with navigation bar.

### Features
- Top navigation bar with logo, tabs, search, notifications, and profile
- D-044: Tools navigation item for Artist Toolbox
- D-071: Global search (Artists + Gigs only)
- D-098: Settings access via profile dropdown
- Responsive design with mobile navigation
- Sticky header for persistent navigation

### Usage

```tsx
import AppLayout from '@/components/layout/AppLayout'

export default function YourPage() {
  return (
    <AppLayout>
      <YourPageContent />
    </AppLayout>
  )
}
```

### Navigation Tabs

The AppLayout includes the following navigation tabs:
- Dashboard → `/dashboard`
- Discover → `/marketplace/gigs`
- Messages → `/messages`
- Violet → `/violet`
- Growth → `/growth`
- Tools → `/tools` (D-044: New navigation item)

### Right Side Elements
- **Search Icon**: Opens global search modal (D-071: Artists + Gigs only)
- **Notification Bell**: Shows unread count badge, opens notification panel
- **Profile Dropdown**: Avatar with dropdown menu (D-098: includes Settings)
- **View My Profile Button**: Direct link to profile view (hidden on mobile)

## PageLayout

Consistent page wrapper with optional header and sidebar.

### Features
- Optional page header with back button, title, subtitle, and action buttons
- Main content area with responsive layout
- Optional right sidebar that collapses on mobile
- Container with consistent padding

### Usage

```tsx
import PageLayout from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'

export default function YourPage() {
  return (
    <PageLayout
      title="Page Title"
      subtitle="Optional subtitle or description"
      backLink="/dashboard"
      actions={
        <Button>Action Button</Button>
      }
      sidebar={
        <div>
          <h3>Sidebar Content</h3>
          <p>Additional information here</p>
        </div>
      }
    >
      <YourContent />
    </PageLayout>
  )
}
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Optional page title |
| `subtitle` | `string` | Optional page subtitle |
| `backLink` | `string` | Optional back button link |
| `actions` | `React.ReactNode` | Optional action buttons in header |
| `sidebar` | `React.ReactNode` | Optional sidebar content |
| `children` | `React.ReactNode` | Main page content |
| `className` | `string` | Optional additional CSS classes |

## Combined Usage

Combine AppLayout and PageLayout for full page structure:

```tsx
import AppLayout from '@/components/layout/AppLayout'
import PageLayout from '@/components/layout/PageLayout'

export default function SettingsPage() {
  return (
    <AppLayout>
      <PageLayout
        title="Account Settings"
        subtitle="Manage your account preferences"
        backLink="/dashboard"
      >
        <SettingsForm />
      </PageLayout>
    </AppLayout>
  )
}
```

## Supporting Components

### ProfileDropdown

Profile menu with avatar and dropdown options.

**Features:**
- Shows user avatar with initials fallback
- Displays user name and email
- Menu items: View My Profile, Settings (D-098), Logout
- Uses mock data until auth flow is complete

**Usage:**
```tsx
import { ProfileDropdown } from '@/components/layout/ProfileDropdown'

<ProfileDropdown />
```

### SearchModal

Global search modal for artists and gigs.

**Features:**
- D-071: Search scope = Artists + Gigs only
- Search input with clear button
- Results grouped by type (Artists, Gigs)
- Empty state with instructions
- For now, uses mock data (real search to be wired later)

**Usage:**
```tsx
import { SearchModal } from '@/components/layout/SearchModal'

const [searchOpen, setSearchOpen] = useState(false)

<SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
```

### NotificationPanel

Dropdown panel showing notifications.

**Features:**
- Shows list of notifications with timestamps
- Unread indicator badge
- Empty state: "No new notifications"
- Mark all as read functionality
- For now, uses mock data (real notifications to be wired later)

**Usage:**
```tsx
import { NotificationPanel } from '@/components/layout/NotificationPanel'

const [notificationsOpen, setNotificationsOpen] = useState(false)

<NotificationPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />
```

### NavigationTabs

Reusable horizontal tab navigation component.

**Features:**
- Active tab indicator (purple underline)
- Uses React Router's useLocation for active state
- Optional icons
- Hover states

**Usage:**
```tsx
import { NavigationTabs } from '@/components/layout/NavigationTabs'

const tabs = [
  { label: 'Tab 1', path: '/tab1' },
  { label: 'Tab 2', path: '/tab2', icon: <Icon /> },
]

<NavigationTabs tabs={tabs} />
```

### BackButton

Back navigation button component.

**Features:**
- Optional 'to' prop for specific navigation
- Falls back to browser back if no 'to' prop provided
- Accessible with keyboard navigation
- Customizable label

**Usage:**
```tsx
import { BackButton } from '@/components/layout/BackButton'

// Navigate to specific route
<BackButton to="/dashboard">Back to Dashboard</BackButton>

// Browser back
<BackButton />
```

### Container

Simple container wrapper with consistent padding.

**Features:**
- Max-width container with centered content
- Responsive horizontal padding
- Optional className for customization

**Usage:**
```tsx
import Container from '@/components/layout/Container'

<Container>
  <YourContent />
</Container>

// With custom class
<Container className="py-8">
  <YourContent />
</Container>
```

## Design Tokens

The layout components use the following design tokens from the theme:

- **Primary color**: purple/violet (`bg-primary`, `text-primary`)
- **Border**: `border-border`
- **Background**: `bg-background`
- **Foreground**: `text-foreground`
- **Muted**: `text-muted-foreground`
- **Card**: `bg-card`
- **Accent**: `bg-accent`

## Responsive Breakpoints

- **Mobile**: < 768px
  - Navigation tabs collapse to bottom navigation
  - Sidebar hidden
  - "View My Profile" button hidden

- **Tablet**: 768px - 1024px
  - Navigation tabs visible in header
  - Sidebar hidden

- **Desktop**: > 1024px
  - Full navigation in header
  - Sidebar visible (if provided)
  - "View My Profile" button visible

## Critical Design Decisions

- **D-044**: "Tools" navigation item added for Artist Toolbox
- **D-071**: Global search scope = Artists + Gigs only (no venues)
- **D-098**: Settings access via profile avatar dropdown

## Mock Data

All components currently use mock data for development:

```typescript
// Mock user data
const mockUser = {
  id: '1',
  full_name: 'Alex Johnson',
  artist_name: 'DJ AlexJ',
  email: 'alex@example.com',
  avatar_url: null,
  verified: true,
}

// Mock notifications
const mockNotifications = [
  { id: '1', message: 'New booking request from The Blue Note', unread: true },
  { id: '2', message: 'Your profile was viewed 12 times today', unread: true },
]
```

Replace with real data once Agent 2A completes auth flow and Agent 2B wires dashboard APIs.

## Next Steps

1. **Auth Integration**: Replace mock user data with real auth context
2. **Search Implementation**: Wire up search API for artists and gigs
3. **Notifications**: Connect to real notification service
4. **Analytics**: Add tracking for navigation events
5. **Accessibility**: Add ARIA labels and keyboard navigation
6. **Performance**: Implement lazy loading for search results

## Dependencies

These layout components depend on:

- React Router (`react-router-dom`) for navigation
- Lucide React (`lucide-react`) for icons
- Radix UI components (via `/components/ui/*`)
- Tailwind CSS for styling
