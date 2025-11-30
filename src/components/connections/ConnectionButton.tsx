/**
 * ConnectionButton Component
 * Button for LinkedIn-style connection actions with multiple states
 *
 * States:
 * - none: "Connect" button
 * - pending_sent: "Pending" button (can cancel)
 * - pending_received: "Accept" / "Decline" buttons
 * - connected: "Connected" dropdown (can remove)
 * - self: No button (own profile)
 */

import { useState } from 'react'
import { UserPlus, UserCheck, Clock, UserMinus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { apiClient } from '@/lib/api-client'
import type { ConnectionStatus } from '@/types'

interface ConnectionButtonProps {
  /** Target user ID */
  userId: string
  /** Target artist ID (for display purposes) */
  artistId?: string
  /** Current connection status */
  status: ConnectionStatus
  /** Connection request ID (if pending) */
  connectionId?: string | null
  /** Callback when status changes */
  onStatusChange?: (newStatus: ConnectionStatus) => void
  /** Optional className for styling */
  className?: string
  /** Show compact version */
  compact?: boolean
}

export function ConnectionButton({
  userId,
  status,
  connectionId,
  onStatusChange,
  className = '',
  compact = false,
}: ConnectionButtonProps) {
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<ConnectionStatus>(status)

  const updateStatus = (newStatus: ConnectionStatus) => {
    setCurrentStatus(newStatus)
    onStatusChange?.(newStatus)
  }

  const handleConnect = async () => {
    setLoading(true)
    try {
      await apiClient.sendConnectionRequest(userId)
      updateStatus('pending_sent')
    } catch (error) {
      console.error('ConnectionButton:connect:error', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!connectionId) return
    setLoading(true)
    try {
      await apiClient.acceptConnectionRequest(connectionId)
      updateStatus('connected')
    } catch (error) {
      console.error('ConnectionButton:accept:error', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!connectionId) return
    setLoading(true)
    try {
      await apiClient.declineConnectionRequest(connectionId)
      updateStatus('none')
    } catch (error) {
      console.error('ConnectionButton:decline:error', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!connectionId) return
    setLoading(true)
    try {
      await apiClient.cancelConnectionRequest(connectionId)
      updateStatus('none')
    } catch (error) {
      console.error('ConnectionButton:cancel:error', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      await apiClient.removeConnection(userId)
      updateStatus('none')
    } catch (error) {
      console.error('ConnectionButton:remove:error', error)
    } finally {
      setLoading(false)
    }
  }

  // Self - no button
  if (currentStatus === 'self') {
    return null
  }

  // Not connected - show Connect button
  if (currentStatus === 'none') {
    return (
      <Button
        onClick={handleConnect}
        disabled={loading}
        className={`gap-2 ${className}`}
        variant="default"
        size={compact ? 'sm' : 'default'}
      >
        <UserPlus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        {!compact && (loading ? 'Sending...' : 'Connect')}
      </Button>
    )
  }

  // Pending sent - show Pending with cancel option
  if (currentStatus === 'pending_sent') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={loading}
            className={`gap-2 ${className}`}
            size={compact ? 'sm' : 'default'}
          >
            <Clock className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            {!compact && 'Pending'}
            <MoreHorizontal className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCancel} className="text-destructive">
            <UserMinus className="mr-2 h-4 w-4" />
            Withdraw Request
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Pending received - show Accept/Decline
  if (currentStatus === 'pending_received') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          onClick={handleAccept}
          disabled={loading}
          variant="default"
          size={compact ? 'sm' : 'default'}
          className="gap-2"
        >
          <UserCheck className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          {!compact && 'Accept'}
        </Button>
        <Button
          onClick={handleDecline}
          disabled={loading}
          variant="outline"
          size={compact ? 'sm' : 'default'}
        >
          {compact ? <UserMinus className="h-3.5 w-3.5" /> : 'Decline'}
        </Button>
      </div>
    )
  }

  // Connected - show Connected with remove option
  if (currentStatus === 'connected') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            disabled={loading}
            className={`gap-2 ${className}`}
            size={compact ? 'sm' : 'default'}
          >
            <UserCheck className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            {!compact && 'Connected'}
            <MoreHorizontal className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleRemove} className="text-destructive">
            <UserMinus className="mr-2 h-4 w-4" />
            Remove Connection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return null
}

export default ConnectionButton
