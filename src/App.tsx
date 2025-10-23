import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { ErrorBoundary } from './components/ErrorBoundary'
import ComponentShowcase from './pages/ComponentShowcase'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="umbrella-theme">
        <ComponentShowcase />
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
