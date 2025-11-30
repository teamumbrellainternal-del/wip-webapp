/**
 * NetworkPage Component
 * Displays user's connections, pending requests, and sent requests
 * Similar to LinkedIn's "My Network" page
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import type { Connection, ConnectionRequest } from '@/types'
import AppLayout from '@/components/layout/AppLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Clock,
  Send,
  UserCheck,
  UserX,
  MapPin,
  Music,
  MessageCircle,
  X,
  RefreshCw,
} from 'lucide-react'
import { MetaTags } from '@/components/MetaTags'

export default function NetworkPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('connections')
  const [connections, setConnections] = useState<Connection[]>([])
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([])
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([])
  const [totalConnections, setTotalConnections] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [connectionsRes, pendingRes, sentRes] = await Promise.all([
        apiClient.getConnections({ limit: 50 }),
        apiClient.getPendingRequests(),
        apiClient.getSentRequests(),
      ])

      setConnections(connectionsRes.connections)
      setTotalConnections(connectionsRes.total)
      setPendingRequests(pendingRes.requests)
      setSentRequests(sentRes.requests)
    } catch (error) {
      console.error('NetworkPage:fetchData:error', error)
      toast({
        title: 'Error loading network',
        description: 'Failed to load your connections. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (request: ConnectionRequest) => {
    setActionLoading(request.connection_id)
    try {
      await apiClient.acceptConnectionRequest(request.connection_id)
      
      // Move from pending to connections
      setPendingRequests((prev) => prev.filter((r) => r.connection_id !== request.connection_id))
      
      // Refresh connections list
      const connectionsRes = await apiClient.getConnections({ limit: 50 })
      setConnections(connectionsRes.connections)
      setTotalConnections(connectionsRes.total)

      toast({
        title: 'Connection accepted!',
        description: `You are now connected with ${request.artist_name}`,
      })
    } catch (error) {
      console.error('NetworkPage:accept:error', error)
      toast({
        title: 'Error',
        description: 'Failed to accept connection request.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (request: ConnectionRequest) => {
    setActionLoading(request.connection_id)
    try {
      await apiClient.declineConnectionRequest(request.connection_id)
      setPendingRequests((prev) => prev.filter((r) => r.connection_id !== request.connection_id))
      toast({
        title: 'Request declined',
        description: 'Connection request has been declined.',
      })
    } catch (error) {
      console.error('NetworkPage:decline:error', error)
      toast({
        title: 'Error',
        description: 'Failed to decline connection request.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (request: ConnectionRequest) => {
    setActionLoading(request.connection_id)
    try {
      await apiClient.cancelConnectionRequest(request.connection_id)
      setSentRequests((prev) => prev.filter((r) => r.connection_id !== request.connection_id))
      toast({
        title: 'Request withdrawn',
        description: 'Your connection request has been withdrawn.',
      })
    } catch (error) {
      console.error('NetworkPage:cancel:error', error)
      toast({
        title: 'Error',
        description: 'Failed to withdraw connection request.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveConnection = async (connection: Connection) => {
    setActionLoading(connection.connection_id)
    try {
      await apiClient.removeConnection(connection.connected_user_id)
      setConnections((prev) => prev.filter((c) => c.connection_id !== connection.connection_id))
      setTotalConnections((prev) => Math.max(0, prev - 1))
      toast({
        title: 'Connection removed',
        description: `You are no longer connected with ${connection.artist_name}`,
      })
    } catch (error) {
      console.error('NetworkPage:remove:error', error)
      toast({
        title: 'Error',
        description: 'Failed to remove connection.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
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

  const formatLocation = (city?: string, state?: string) => {
    if (city && state) return `${city}, ${state}`
    return city || state || 'Unknown location'
  }

  const renderLoadingSkeletons = (count: number) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderConnectionCard = (connection: Connection) => (
    <Card key={connection.connection_id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link to={`/artist/${connection.artist_id}`}>
            <Avatar className="h-16 w-16">
              <AvatarImage src={connection.avatar_url} alt={connection.artist_name} />
              <AvatarFallback>{getInitials(connection.artist_name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/artist/${connection.artist_id}`}
              className="font-semibold text-foreground hover:underline truncate block"
            >
              {connection.artist_name}
            </Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {formatLocation(connection.location_city, connection.location_state)}
              </span>
            </div>
            {connection.primary_genre && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Music className="h-3 w-3" />
                <span>{connection.primary_genre}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Link to={`/messages?user=${connection.connected_user_id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                Message
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => handleRemoveConnection(connection)}
              disabled={actionLoading === connection.connection_id}
            >
              {actionLoading === connection.connection_id ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderPendingCard = (request: ConnectionRequest) => (
    <Card key={request.connection_id} className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link to={`/artist/${request.artist_id}`}>
            <Avatar className="h-16 w-16">
              <AvatarImage src={request.avatar_url} alt={request.artist_name} />
              <AvatarFallback>{getInitials(request.artist_name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/artist/${request.artist_id}`}
              className="font-semibold text-foreground hover:underline truncate block"
            >
              {request.artist_name}
            </Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {formatLocation(request.location_city, request.location_state)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sent {new Date(request.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="gap-1"
              onClick={() => handleAccept(request)}
              disabled={actionLoading === request.connection_id}
            >
              {actionLoading === request.connection_id ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserCheck className="h-3.5 w-3.5" />
              )}
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => handleDecline(request)}
              disabled={actionLoading === request.connection_id}
            >
              <UserX className="h-3.5 w-3.5" />
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderSentCard = (request: ConnectionRequest) => (
    <Card key={request.connection_id} className="hover:shadow-md transition-shadow opacity-75">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link to={`/artist/${request.artist_id}`}>
            <Avatar className="h-16 w-16">
              <AvatarImage src={request.avatar_url} alt={request.artist_name} />
              <AvatarFallback>{getInitials(request.artist_name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/artist/${request.artist_id}`}
              className="font-semibold text-foreground hover:underline truncate block"
            >
              {request.artist_name}
            </Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {formatLocation(request.location_city, request.location_state)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>Pending since {new Date(request.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={() => handleCancel(request)}
            disabled={actionLoading === request.connection_id}
          >
            {actionLoading === request.connection_id ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderEmptyState = (type: 'connections' | 'pending' | 'sent') => {
    const config = {
      connections: {
        icon: Users,
        title: 'No connections yet',
        description: 'Connect with other artists to grow your network.',
        action: (
          <Link to="/marketplace/artists">
            <Button className="mt-4">Discover Artists</Button>
          </Link>
        ),
      },
      pending: {
        icon: Clock,
        title: 'No pending requests',
        description: 'You have no connection requests waiting for your response.',
        action: null,
      },
      sent: {
        icon: Send,
        title: 'No sent requests',
        description: 'You haven\'t sent any connection requests.',
        action: (
          <Link to="/marketplace/artists">
            <Button variant="outline" className="mt-4">
              Find Artists to Connect
            </Button>
          </Link>
        ),
      },
    }

    const { icon: Icon, title, description, action } = config[type]

    return (
      <div className="text-center py-12">
        <Icon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground mt-1">{description}</p>
        {action}
      </div>
    )
  }

  return (
    <AppLayout>
      <MetaTags
        title="My Network | Umbrella"
        description="Manage your professional connections on Umbrella"
        url="/network"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Network</h1>
          <p className="text-muted-foreground mt-1">
            Manage your professional connections
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="connections" className="gap-2">
              <Users className="h-4 w-4" />
              Connections
              {totalConnections > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {totalConnections}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="default" className="ml-1 bg-purple-500">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="h-4 w-4" />
              Sent
              {sentRequests.length > 0 && (
                <Badge variant="outline" className="ml-1">
                  {sentRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Connections Tab */}
          <TabsContent value="connections">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {totalConnections} {totalConnections === 1 ? 'Connection' : 'Connections'}
                </CardTitle>
                <CardDescription>
                  Your professional network of artists and collaborators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  renderLoadingSkeletons(6)
                ) : connections.length === 0 ? (
                  renderEmptyState('connections')
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {connections.map(renderConnectionCard)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  Pending Requests
                </CardTitle>
                <CardDescription>
                  Connection requests waiting for your response
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  renderLoadingSkeletons(3)
                ) : pendingRequests.length === 0 ? (
                  renderEmptyState('pending')
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingRequests.map(renderPendingCard)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sent Tab */}
          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Sent Requests
                </CardTitle>
                <CardDescription>
                  Connection requests you've sent that are awaiting response
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  renderLoadingSkeletons(3)
                ) : sentRequests.length === 0 ? (
                  renderEmptyState('sent')
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sentRequests.map(renderSentCard)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

