import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TestAuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-slate-50 p-4 dark:from-slate-950 dark:to-purple-950">
      <div className="w-full max-w-xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
          <AlertCircle className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Test authentication route unavailable</h1>
        </div>

        <div className="space-y-3 text-muted-foreground">
          <p>
            The <code>/auth/test</code> route is intended for internal testing and bypassing the
            normal sign-in flow. It is currently disabled in this environment.
          </p>
          <p>Please return to the standard authentication page to continue using Umbrella.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="/auth">Go to sign in</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/">
              {' '}
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
