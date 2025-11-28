/**
 * ProfileDropdown Component
 * Reusable dropdown for profile menu with Settings access
 *
 * Features:
 * - Shows avatar with artist name initials, artist name, email
 * - Menu items: View Profile, Settings (D-098), Logout
 * - Uses artist name from profile API, falls back to Clerk user data
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Settings, LogOut } from 'lucide-react'
import { useClerk, useUser } from '@clerk/clerk-react'
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

// Mock user data - only used in demo mode
const mockUser = {
  artist_name: 'DJ AlexJ',
  email: 'alex@example.com',
  avatar_url: null,
}

// User data shape for ProfileDropdownContent
interface UserData {
  artist_name: string
  email: string
  avatar_url: string | null
}

// Production version that uses Clerk + Artist profile
function ProfileDropdownProduction() {
  const navigate = useNavigate()
  const clerk = useClerk()
  const { user: clerkUser } = useUser()
  const [artistName, setArtistName] = useState<string | null>(null)

  // Fetch artist profile to get artist name
  useEffect(() => {
    const fetchArtistName = async () => {
      try {
        const profile = await apiClient.getProfile()
        // Backend returns stage_name, frontend types expect artist_name
        const name = (profile as any).stage_name || profile?.artist_name
        if (name) {
          setArtistName(name)
        }
      } catch (error) {
        // Silently fail - will use fallback
        console.debug('Could not fetch artist profile for dropdown:', error)
      }
    }

    if (clerkUser) {
      fetchArtistName()
    }
  }, [clerkUser])

  const handleLogout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      localStorage.removeItem('umbrella_session')
      if (clerk) {
        await clerk.signOut()
      }
      navigate('/auth')
    }
  }

  // Build user data - prefer artist name over Clerk name
  const userData: UserData = {
    artist_name: artistName || clerkUser?.fullName || clerkUser?.firstName || 'User',
    email: clerkUser?.primaryEmailAddress?.emailAddress || '',
    avatar_url: null, // Don't use Clerk avatar, use initials
  }

  return <ProfileDropdownContent user={userData} onLogout={handleLogout} />
}

// Demo version that doesn't use Clerk
function ProfileDropdownDemo() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      localStorage.removeItem('umbrella_session')
      navigate('/auth')
    }
  }

  return <ProfileDropdownContent user={mockUser} onLogout={handleLogout} />
}

// Shared content component - receives user data as prop
function ProfileDropdownContent({ user, onLogout }: { user: UserData; onLogout: () => void }) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) {
      // Single word name - use first letter only
      return parts[0][0]?.toUpperCase() || 'U'
    }
    // Multiple words - use first letter of each (up to 2)
    return parts
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.artist_name} />}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.artist_name)}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Open profile menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.artist_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
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
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ProfileDropdown() {
  // Conditionally render based on demo mode
  if (DEMO_MODE) {
    return <ProfileDropdownDemo />
  }
  return <ProfileDropdownProduction />
}
