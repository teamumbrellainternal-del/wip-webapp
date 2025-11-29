# Frontend

React 18 SPA with TypeScript, Vite, and Tailwind CSS.

## Structure

```
src/
├── main.tsx          # Entry point
├── App.tsx           # Root component with providers
├── routes/           # Route definitions
├── pages/            # Page components
├── components/       # Reusable components
│   ├── ui/           # shadcn/ui primitives
│   ├── layout/       # App shell, nav, sidebar
│   ├── auth/         # Auth guards
│   └── violet/       # AI chat components
├── hooks/            # Custom React hooks
├── contexts/         # React context providers
├── lib/              # Utilities & API client
├── services/         # API service layer
└── types/            # TypeScript interfaces
```

## Key Files

| File | Purpose |
|------|---------|
| `routes/index.tsx` | All app routes |
| `lib/api-client.ts` | HTTP client for backend |
| `contexts/AuthContext.tsx` | Clerk auth state |
| `components/layout/AppLayout.tsx` | Main layout wrapper |

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | LoginPage | Google OAuth login |
| `/dashboard` | DashboardPage | Main dashboard |
| `/marketplace` | MarketplacePage | Browse gigs |
| `/gig/:id` | GigDetailsPage | Gig details |
| `/profile` | ProfilePage | Own profile |
| `/profile/edit` | ProfileEditPage | Edit profile |
| `/artists/:id` | ProfileViewPage | View artist |
| `/messages` | MessagesPage | Conversations |
| `/message-fans` | MessageFansPage | Broadcast to fans |
| `/files` | FilesPage | File manager |
| `/violet` | VioletPage | AI assistant |
| `/growth` | GrowthPage | Analytics dashboard |
| `/toolbox` | ToolboxPage | Artist tools hub |
| `/creative-studio` | CreativeStudioPage | Journal/creative |
| `/settings` | SettingsPage | Account settings |
| `/onboarding/*` | Step1-4 | Onboarding flow |

## Components

UI built with [shadcn/ui](https://ui.shadcn.com/):

```bash
# Add new shadcn component
npx shadcn-ui@latest add button
```

Custom components in `components/`:
- `layout/` - AppLayout, PageHeader, Navigation
- `auth/` - ProtectedRoute, OnboardingGuard
- `violet/` - AI chat interface

## State Management

- **Auth**: Clerk SDK + AuthContext
- **Server state**: Direct API calls (no React Query)
- **UI state**: Component-level useState

## Styling

Tailwind CSS with custom design tokens from `brand/`:

```tsx
// Use Tailwind classes
<div className="bg-background text-foreground">

// Theme toggle available
import { useTheme } from '@/hooks/use-theme'
```

## Development

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # Production build
npm run preview    # Preview production build
```

