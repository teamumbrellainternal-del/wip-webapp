# Layout Components

App shell and navigation components.

## Components

| Component | Purpose |
|-----------|---------|
| `AppLayout` | Main authenticated layout with nav bar |
| `PageLayout` | Page wrapper with header, sidebar |
| `ProfileDropdown` | User menu (profile, settings, logout) |
| `SearchModal` | Global search (artists + gigs) |
| `NotificationPanel` | Notifications dropdown |
| `NavigationTabs` | Horizontal tab navigation |
| `BackButton` | Back navigation |
| `Container` | Max-width content wrapper |

## Usage

```tsx
// Full page structure
import AppLayout from '@/components/layout/AppLayout'
import PageLayout from '@/components/layout/PageLayout'

export default function YourPage() {
  return (
    <AppLayout>
      <PageLayout
        title="Page Title"
        subtitle="Description"
        backLink="/dashboard"
        actions={<Button>Action</Button>}
      >
        <YourContent />
      </PageLayout>
    </AppLayout>
  )
}
```

## Navigation Tabs

Main nav items in `AppLayout`:
- Dashboard → `/dashboard`
- Discover → `/marketplace/gigs`
- Messages → `/messages`
- Violet → `/violet`
- Growth → `/growth`
- Tools → `/toolbox`

## Responsive Behavior

- **Mobile (<768px)**: Bottom navigation, no sidebar
- **Desktop (>1024px)**: Header nav, optional sidebar
