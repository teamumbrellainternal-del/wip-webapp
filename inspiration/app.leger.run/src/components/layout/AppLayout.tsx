/**
 * App Layout Component
 * Two-row header navigation with outlet for child routes
 * Row 1: Global context (scrolls away)
 * Row 2: Primary navigation (sticky)
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { isTestMode } from '@/lib/session';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Navigation link component
  const NavLink = ({
    to,
    disabled,
    children,
  }: {
    to: string;
    disabled?: boolean;
    children: React.ReactNode;
  }) => {
    const active = location.pathname === to || location.pathname.startsWith(`${to}/`);

    if (disabled) {
      return (
        <span className="text-muted-foreground cursor-not-allowed flex items-center">
          {children}
        </span>
      );
    }

    return (
      <Link
        to={to}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          active
            ? 'text-foreground border-b-2 border-primary pb-2'
            : 'text-muted-foreground'
        )}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Test Mode Banner */}
      {isTestMode() && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Test Mode Active</span>
            <span className="text-muted-foreground">
              - You are logged in as a test user for development/testing
            </span>
          </div>
        </div>
      )}

      <header className="border-b">
        {/* Row 1: Global Context (scrolls away) */}
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/brand/assets/icon/dark/leger-icon-dark.svg"
                alt="Leger"
                className="h-6 w-6"
              />
              <span className="font-semibold">Leger</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* GitHub Star */}
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/leger-labs/leger"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star className="h-4 w-4 mr-2" />
                Star
              </a>
            </Button>

            {/* Changelog */}
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://www.leger.run/changelog"
                target="_blank"
                rel="noopener noreferrer"
              >
                Changelog
              </a>
            </Button>

            {/* Docs */}
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://docs.leger.run"
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs
              </a>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Avatar with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.tailnet}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2: Primary Navigation (sticky) */}
        <div className="sticky top-0 bg-background z-10 px-4 py-2 border-b">
          <nav className="flex items-center gap-6">
            <NavLink to="/api-keys">API Keys</NavLink>
            <NavLink to="/releases">Releases</NavLink>
            <NavLink to="/models" disabled>
              Models
              <Badge variant="secondary" className="ml-2 text-xs">
                Soon
              </Badge>
            </NavLink>
            <NavLink to="/marketplace" disabled>
              Marketplace
              <Badge variant="secondary" className="ml-2 text-xs">
                Soon
              </Badge>
            </NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
