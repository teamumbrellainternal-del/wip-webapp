import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { ErrorBoundary } from './components/ErrorBoundary'
import ComponentShowcase from './pages/ComponentShowcase'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return user ? <DashboardPage /> : <LoginPage />
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="umbrella-theme">
        <ComponentShowcase />
        <Toaster />
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
