import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="umbrella-theme">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto py-10">
            <h1 className="text-4xl font-bold tracking-tight">Umbrella MVP</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Artist marketplace connecting musicians with venues
            </p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
