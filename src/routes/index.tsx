import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import PlaceholderPage from '@/pages/placeholders/PlaceholderPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import OnboardingGuard from '@/components/auth/OnboardingGuard'

/**
 * Main application router using React Router v6
 *
 * Route Protection Layers:
 * 1. ProtectedRoute - Ensures user is authenticated
 * 2. OnboardingGuard - Ensures user has completed onboarding (D-006)
 *
 * Public routes: /auth, /terms, /privacy
 * All other routes require authentication and onboarding completion
 */
export const router = createBrowserRouter([
  // Root - Redirect to dashboard
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // Public: Authentication
  {
    path: '/auth',
    element: <LoginPage />,
  },

  // Public: Legal pages
  {
    path: '/terms',
    element: <PlaceholderPage title="Terms of Service" />,
  },
  {
    path: '/privacy',
    element: <PlaceholderPage title="Privacy Policy" />,
  },

  // Onboarding Routes (Protected but no OnboardingGuard)
  {
    path: '/onboarding/role-selection',
    element: (
      <ProtectedRoute>
        <PlaceholderPage title="Select Your Role" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/artists/step1',
    element: (
      <ProtectedRoute>
        <PlaceholderPage title="Step 1: Identity & Basics" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/artists/step2',
    element: (
      <ProtectedRoute>
        <PlaceholderPage title="Step 2: Links & Your Story" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/artists/step3',
    element: (
      <ProtectedRoute>
        <PlaceholderPage title="Step 3: Creative Profile Tags" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/artists/step4',
    element: (
      <ProtectedRoute>
        <PlaceholderPage title="Step 4: Your Numbers" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/artists/step5',
    element: (
      <ProtectedRoute>
        <PlaceholderPage title="Step 5: Quick Questions" />
      </ProtectedRoute>
    ),
  },

  // Main Application Routes (Protected + OnboardingGuard)

  // Dashboard
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <DashboardPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Marketplace
  {
    path: '/marketplace/gigs',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Find Gigs" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/marketplace/artists',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Discover Artists" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Artist Profile (with dynamic ID)
  {
    path: '/artist/:id',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Artist Profile" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Gig Details (with dynamic ID)
  {
    path: '/gig/:id',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Gig Details" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Profile Management (D-022: Separate /profile/edit route)
  {
    path: '/profile/view',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="My Profile" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/edit',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Edit Profile" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Messages
  {
    path: '/messages',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Messages" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/messages/:conversationId',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Conversation" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Violet AI Toolkit
  {
    path: '/violet',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Violet AI Toolkit" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Growth & Analytics
  {
    path: '/growth',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Growth & Analytics" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Tools (D-044: Artist Toolbox)
  {
    path: '/tools',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Artist Toolbox" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/tools/message-fans',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Message Fans" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/tools/files',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="My Files" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/tools/studio',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Creative Studio" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Settings (D-098: Access via profile avatar dropdown)
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <PlaceholderPage title="Account Settings" />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // 404 Fallback
  {
    path: '*',
    element: <PlaceholderPage title="404 - Page Not Found" />,
  },
])
