import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignIn, useAuth } from '@clerk/clerk-react'
import { MetaTags } from '../components/MetaTags'
import { Check } from 'lucide-react'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

// Marketing carousel slides
const carouselSlides = [
  {
    icon: '🎤',
    title: 'Find Your Perfect Gig',
    description:
      'Connect with venues actively seeking talent. Get matched with opportunities that fit your style and schedule.',
  },
  {
    icon: '🎵',
    title: 'Grow Your Fanbase',
    description:
      'Build your audience with powerful tools for fan engagement, email marketing, and social media integration.',
  },
  {
    icon: '💰',
    title: 'Get Paid Fairly',
    description:
      'Transparent pricing, secure payments, and professional contracts protect your worth as an artist.',
  },
]

// Feature highlights
const features = [
  'Verified venue partnerships',
  'Smart gig matching',
  'Professional portfolio builder',
  'Secure booking system',
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { isSignedIn, isLoaded } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (DEMO_MODE) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  // Auto-redirect to dashboard if already authenticated
  useEffect(() => {
    if (DEMO_MODE) return

    if (isLoaded && isSignedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  if (DEMO_MODE) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-slate-50 p-4 dark:from-slate-950 dark:to-purple-950">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500">
            <span className="text-2xl font-bold text-white">U</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Demo Mode</h1>
          <p className="text-muted-foreground">
            You are already logged in as the demo user. Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    )
  }

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50/50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-purple-500">
            <span className="text-2xl font-bold text-white">U</span>
          </div>
        </div>
      </div>
    )
  }

  // Don't render sign in if already signed in
  if (isSignedIn) {
    return null
  }

  const currentContent = carouselSlides[currentSlide]

  return (
    <>
      <MetaTags
        title="Log In"
        description="Sign in to your Umbrella account to access your artist dashboard, manage gigs, and connect with opportunities."
        url="/auth"
        noIndex={true}
      />

      <div className="flex min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
        {/* Left Column - Marketing Content */}
        <div className="hidden w-full max-w-xl flex-col justify-center px-12 py-12 lg:flex xl:max-w-2xl xl:px-16">
          {/* Logo & Brand */}
          <div className="mb-8 flex items-center gap-3">
            <img src="/icon.svg" alt="Umbrella" className="h-12 w-12 rounded-2xl" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Umbrella</h1>
              <p className="text-sm text-muted-foreground">Artist Platform</p>
            </div>
          </div>

          {/* Carousel Content */}
          <div className="mb-8">
            {/* Icon */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-900/30">
              <span className="text-3xl">{currentContent.icon}</span>
            </div>

            {/* Title & Description */}
            <h2 className="mb-4 text-heading-32 text-foreground">{currentContent.title}</h2>
            <p className="text-copy-18 text-muted-foreground">{currentContent.description}</p>

            {/* Carousel Dots */}
            <div className="mt-6 flex gap-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-purple-500'
                      : 'w-2 bg-purple-200 hover:bg-purple-300 dark:bg-purple-800 dark:hover:bg-purple-700'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-copy-16 text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Sign In Form */}
        <div className="flex w-full flex-1 items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo - Only shows on mobile */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <img src="/icon.svg" alt="Umbrella" className="h-12 w-12 rounded-2xl" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Umbrella</h1>
                <p className="text-sm text-muted-foreground">Artist Platform</p>
              </div>
            </div>

            {/* Sign In Card */}
            <div className="rounded-3xl bg-card p-8 shadow-xl dark:bg-card/95 dark:backdrop-blur-sm">
              {/* Header */}
              <div className="mb-6 text-center">
                <h2 className="text-heading-24 text-foreground">Welcome Back</h2>
                <p className="mt-2 text-copy-14 text-muted-foreground">
                  Sign in to continue your creative journey
                </p>
          </div>

          {/* Clerk Sign In Component */}
          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto w-full',
                    card: 'shadow-none bg-transparent p-0',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                      'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-border transition-all duration-200 rounded-lg h-11',
                    socialButtonsBlockButtonText: 'font-medium text-sm',
                    socialButtonsBlockButtonArrow: 'hidden',
                    dividerLine: 'bg-border',
                    dividerText: 'text-muted-foreground text-sm',
                    formButtonPrimary:
                      'bg-purple-500 hover:bg-purple-600 text-white font-semibold h-11 rounded-lg transition-all duration-200',
                    formFieldLabel: 'font-medium text-sm text-foreground',
                    formFieldInput:
                      'rounded-lg border-border h-11 focus:border-purple-500 focus:ring-purple-500/20',
                    footerActionLink: 'text-purple-500 hover:text-purple-600 font-medium',
                identityPreviewText: 'text-sm',
                    identityPreviewEditButton: 'text-purple-500 hover:text-purple-600',
                    formFieldAction: 'text-purple-500 hover:text-purple-600 text-sm font-medium',
                    otpCodeFieldInput: 'border-border rounded-lg',
                    formResendCodeLink: 'text-purple-500 hover:text-purple-600',
                    footer: 'pt-4',
                    footerAction: 'text-sm',
                    footerActionText: 'text-muted-foreground',
              },
              layout: {
                    socialButtonsPlacement: 'bottom',
                socialButtonsVariant: 'blockButton',
              },
            }}
            forceRedirectUrl="/auth/sso-callback"
            routing="path"
            path="/auth"
          />
            </div>

          {/* Footer */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-purple-500 hover:text-purple-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-purple-500 hover:text-purple-600 hover:underline">
                Privacy Policy
              </a>
          </p>
          </div>
        </div>
      </div>
    </>
  )
}
