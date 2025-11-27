import { Link } from 'react-router-dom'
import UmbrellaIcon from '@brand/assets/logos/umbrella-icon.svg'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Left side: Brand */}
          <div className="flex items-center gap-2">
            <img src={UmbrellaIcon} alt="Umbrella" className="h-6 w-6 rounded-lg" />
            <span className="text-sm text-muted-foreground">
              © {currentYear} Umbrella. All rights reserved.
            </span>
          </div>

          {/* Right side: Legal links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/legal/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              to="/legal/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              to="/legal/cookies"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cookie Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
