/**
 * MutualConnections Component
 * Displays mutual connections between current user and a target user
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { apiClient } from '@/lib/api-client'
import type { MutualConnection } from '@/types'

interface MutualConnectionsProps {
  /** Target user ID to check mutual connections with */
  userId: string
  /** Maximum number of avatars to show */
  maxDisplay?: number
  /** Optional className */
  className?: string
}

export function MutualConnections({
  userId,
  maxDisplay = 3,
  className = '',
}: MutualConnectionsProps) {
  const [mutuals, setMutuals] = useState<MutualConnection[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMutuals = async () => {
      try {
        const response = await apiClient.getMutualConnections(userId)
        setMutuals(response.mutual_connections)
        setTotalCount(response.count)
      } catch (error) {
        console.error('MutualConnections:fetch:error', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMutuals()
  }, [userId])

  // Don't render if loading or no mutual connections
  if (loading || totalCount === 0) {
    return null
  }

  const displayedMutuals = mutuals.slice(0, maxDisplay)
  const remainingCount = totalCount - displayedMutuals.length

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Users className="h-4 w-4 text-muted-foreground" />

      {/* Avatar stack */}
      <div className="flex -space-x-2">
        {displayedMutuals.map((mutual) => (
          <Link key={mutual.user_id} to={`/artist/${mutual.artist_id}`} className="relative block">
            <Avatar className="h-6 w-6 border-2 border-background transition-transform hover:z-10 hover:scale-110">
              <AvatarImage src={mutual.avatar_url} alt={mutual.artist_name} />
              <AvatarFallback className="text-[10px]">
                {getInitials(mutual.artist_name)}
              </AvatarFallback>
            </Avatar>
          </Link>
        ))}
      </div>

      {/* Text */}
      <span className="text-sm text-muted-foreground">
        {totalCount === 1 ? (
          <>
            <Link
              to={`/artist/${displayedMutuals[0]?.artist_id}`}
              className="font-medium text-foreground hover:underline"
            >
              {displayedMutuals[0]?.artist_name}
            </Link>{' '}
            is a mutual connection
          </>
        ) : remainingCount > 0 ? (
          <>
            <Link
              to={`/artist/${displayedMutuals[0]?.artist_id}`}
              className="font-medium text-foreground hover:underline"
            >
              {displayedMutuals[0]?.artist_name}
            </Link>{' '}
            and {remainingCount + displayedMutuals.length - 1} other mutual{' '}
            {remainingCount + displayedMutuals.length - 1 === 1 ? 'connection' : 'connections'}
          </>
        ) : (
          <>
            {displayedMutuals.length} mutual{' '}
            {displayedMutuals.length === 1 ? 'connection' : 'connections'}
          </>
        )}
      </span>
    </div>
  )
}

export default MutualConnections
