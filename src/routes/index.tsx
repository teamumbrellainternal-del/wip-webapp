import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import SSOCallbackPage from '@/pages/SSOCallbackPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import ProfileViewPage from '@/pages/ProfileViewPage'
import ProfileEditPage from '@/pages/ProfileEditPage'
import MarketplacePage from '@/pages/MarketplacePage'
import TestAuthPage from '@/pages/TestAuthPage'
import MessagesPage from '@/pages/MessagesPage'
import VioletPage from '@/pages/VioletPage'
import VioletChatPage from '@/pages/VioletChatPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import OnboardingGuard from '@/components/auth/OnboardingGuard'
import Step2 from '@/pages/onboarding/Step2'
import Step3 from '@/pages/onboarding/Step3'
import Step4 from '@/pages/onboarding/Step4'
import OnboardingStep1 from '@/pages/onboarding/Step1'
import TermsPage from '@/pages/legal/TermsPage'
import PrivacyPage from '@/pages/legal/PrivacyPage'
import CookiesPage from '@/pages/legal/CookiesPage'
import SettingsPage from '@/pages/SettingsPage'
import RoleSelectionPage from '@/pages/onboarding/RoleSelectionPage'
import GigDetailsPage from '@/pages/GigDetailsPage'
import GrowthPage from '@/pages/GrowthPage'
import ToolboxPage from '@/pages/ToolboxPage'
import FilesPage from '@/pages/FilesPage'
import MessageFansPage from '@/pages/MessageFansPage'
import CreativeStudioPage from '@/pages/CreativeStudioPage'
import NetworkPage from '@/pages/NetworkPage'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

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
    element: DEMO_MODE ? <Navigate to="/dashboard" replace /> : <LoginPage />,
  },
  {
    path: '/auth/test',
    element: <TestAuthPage />,
  },
  {
    path: '/sso-callback',
    element: DEMO_MODE ? <Navigate to="/dashboard" replace /> : <SSOCallbackPage />,
  },
  {
    path: '/auth/sso-callback',
    element: DEMO_MODE ? <Navigate to="/dashboard" replace /> : <SSOCallbackPage />,
  },

  // Public: Legal pages
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/legal/terms',
    element: <TermsPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/legal/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/legal/cookies',
    element: <CookiesPage />,
  },

  // Onboarding Routes (Protected but no OnboardingGuard)
  {
    path: '/onboarding/role-selection',
    element: (
      <ProtectedRoute>
        <RoleSelectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/artists/step1',
    element: (
      <ProtectedRoute>
        <OnboardingStep1 />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/artists/step2',
    element: (
      <ProtectedRoute>
        <Step2 />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/artists/step3',
    element: (
      <ProtectedRoute>
        <Step3 />
      </ProtectedRoute>
    ),
  },
  {
    path: '/onboarding/artists/step4',
    element: (
      <ProtectedRoute>
        <Step4 />
      </ProtectedRoute>
    ),
  },
  {
    // Step 5 removed - redirect to Step 4 for backward compatibility
    path: '/onboarding/artists/step5',
    element: <Navigate to="/onboarding/artists/step4" replace />,
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
          <MarketplacePage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/marketplace/artists',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <MarketplacePage />
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
          <ProfilePage />
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
          <GigDetailsPage />
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
          <ProfileViewPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/edit',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <ProfileEditPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Network (Connections)
  {
    path: '/network',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <NetworkPage />
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
          <MessagesPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/messages/:conversationId',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <MessagesPage />
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
          <VioletPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Violet AI Chat Interface
  {
    path: '/violet/chat',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <VioletChatPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/violet/chat/:conversationId',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <VioletChatPage />
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
          <GrowthPage />
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
          <SettingsPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // Artist Toolbox
  {
    path: '/tools',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <ToolboxPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/tools/files',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <FilesPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/tools/message-fans',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <MessageFansPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/tools/studio',
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <CreativeStudioPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  // 404 Fallback
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
