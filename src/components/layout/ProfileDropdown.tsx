/**
 * ProfileDropdown Component
 * Reusable dropdown for profile menu with Settings access
 *
 * Features:
 * - Shows avatar, name, email
 * - Menu items: View Profile, Settings (D-098), Logout
 * - Uses mock data until auth flow is complete
 */

import { Link, useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { User, Settings, LogOut } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Check if demo mode is enabled
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

// Mock user data (replace with real data from auth context)
const mockUser = {
  id: '1',
  full_name: 'Alex Johnson',
  artist_name: 'DJ AlexJ',
  email: 'alex@example.com',
  avatar_url: null, // will show initials
  verified: true,
}

export function ProfileDropdown() {
  const navigate = useNavigate()
  
  // Always call the hook - hooks must be called unconditionally
  const clerk = useClerk()
  
  // Determine if we should use Clerk based on demo mode
  const shouldUseClerk = !DEMO_MODE

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await apiClient.logout()
    } catch (error) {
      console.error('Error during logout:', error)
      // Continue with logout even if backend call fails
    } finally {
      // Clear local session
      localStorage.removeItem('umbrella_session')

      // Sign out from Clerk if available and not in demo mode
      if (shouldUseClerk && clerk) {
        await clerk.signOut()
      }

      // Navigate to auth page
      navigate('/auth')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            {mockUser.avatar_url && (
              <AvatarImage src={mockUser.avatar_url} alt={mockUser.full_name} />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(mockUser.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Open profile menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{mockUser.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {mockUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile/edit" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            View My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
