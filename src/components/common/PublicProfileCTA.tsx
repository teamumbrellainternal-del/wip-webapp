/**
 * PublicProfileCTA Component
 * Call-to-action for unauthenticated users viewing public profiles
 * Encourages signup with contextual messaging
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, MessageCircle, Music, Star } from 'lucide-react'
import { logger } from '@/utils/logger'

interface PublicProfileCTAProps {
  /** The URL to return to after signup */
  returnUrl?: string
  /** The type of profile being viewed */
  profileType: 'artist' | 'venue'
  /** The name of the profile being viewed */
  profileName?: string
  /** Variant: 'button' for inline, 'banner' for full-width */
  variant?: 'button' | 'banner'
  /** Custom CTA text override */
  ctaText?: string
}

/**
 * Button variant - compact CTA for replacing action buttons
 */
export function PublicProfileCTAButton({
  returnUrl,
  profileType,
  ctaText,
}: Pick<PublicProfileCTAProps, 'returnUrl' | 'profileType' | 'ctaText'>) {
  const navigate = useNavigate()

  const handleClick = () => {
    logger.info('User clicked Join Umbrella CTA', {
      component: 'PublicProfileCTA',
      action: 'handleClick',
      profileType,
      returnUrl,
    })

    const authUrl = returnUrl ? `/auth?returnUrl=${encodeURIComponent(returnUrl)}` : '/auth'
    navigate(authUrl)
  }

  const defaultText = profileType === 'artist' ? 'Join to Connect' : 'Join to Book'

  return (
    <Button onClick={handleClick} className="gap-2 bg-purple-500 hover:bg-purple-600">
      <UserPlus className="h-4 w-4" />
      {ctaText || defaultText}
    </Button>
  )
}

/**
 * Banner variant - full-width CTA with benefits messaging
 */
export function PublicProfileCTABanner({
  returnUrl,
  profileType,
  profileName,
}: Pick<PublicProfileCTAProps, 'returnUrl' | 'profileType' | 'profileName'>) {
  const navigate = useNavigate()

  const handleClick = () => {
    logger.info('User clicked Join Umbrella banner CTA', {
      component: 'PublicProfileCTA',
      action: 'handleClick',
      profileType,
      profileName,
      returnUrl,
    })

    const authUrl = returnUrl ? `/auth?returnUrl=${encodeURIComponent(returnUrl)}` : '/auth'
    navigate(authUrl)
  }

  const benefits =
    profileType === 'artist'
      ? [
          { icon: MessageCircle, text: 'Send booking inquiries' },
          { icon: UserPlus, text: 'Connect with artists' },
          { icon: Star, text: 'Leave reviews' },
        ]
      : [
          { icon: MessageCircle, text: 'Contact venues directly' },
          { icon: Music, text: 'Apply to gigs' },
          { icon: UserPlus, text: 'Build your network' },
        ]

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/50 dark:to-pink-950/50">
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center md:flex-row md:text-left">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-purple-900 dark:text-purple-100">
            {profileName
              ? `Want to connect with ${profileName}?`
              : `Ready to ${profileType === 'artist' ? 'book artists' : 'find gigs'}?`}
          </h3>
          <p className="mb-3 text-sm text-purple-700 dark:text-purple-300">
            Join Umbrella to unlock all features:
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            {benefits.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400"
              >
                <Icon className="h-4 w-4" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleClick} size="lg" className="gap-2 bg-purple-500 hover:bg-purple-600">
          <UserPlus className="h-5 w-5" />
          Join Umbrella
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Main export - auto-selects variant based on prop
 */
export default function PublicProfileCTA({
  returnUrl,
  profileType,
  profileName,
  variant = 'banner',
  ctaText,
}: PublicProfileCTAProps) {
  if (variant === 'button') {
    return (
      <PublicProfileCTAButton returnUrl={returnUrl} profileType={profileType} ctaText={ctaText} />
    )
  }

  return (
    <PublicProfileCTABanner
      returnUrl={returnUrl}
      profileType={profileType}
      profileName={profileName}
    />
  )
}
