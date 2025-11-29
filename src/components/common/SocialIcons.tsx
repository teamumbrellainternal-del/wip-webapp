/**
 * Social Platform Icons and Links Bar Component
 * Displays clickable icons for artist social media profiles
 */

// TikTok Icon
export const TikTokIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

// Spotify Icon
export const SpotifyIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
)

// Apple Music Icon
export const AppleMusicIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.401-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.8-.228-2.403-.96-.63-.767-.7-1.636-.37-2.526.348-.922 1.077-1.45 2.024-1.645.287-.06.58-.09.87-.124.453-.05.904-.1 1.35-.18.162-.028.322-.072.478-.138.07-.03.097-.082.097-.16-.003-1.58-.002-3.16-.002-4.74 0-.1-.031-.14-.136-.154-.542-.077-1.084-.16-1.627-.235-.918-.128-1.836-.253-2.755-.378-.024-.003-.05-.003-.083-.005-.01.097-.022.184-.022.272-.005 2.442-.004 4.885-.007 7.328 0 .413-.05.82-.23 1.194-.29.595-.77.974-1.407 1.148-.35.096-.706.15-1.065.166-.96.037-1.817-.24-2.418-.985-.618-.764-.682-1.625-.354-2.51.342-.923 1.074-1.457 2.028-1.656.29-.06.585-.093.878-.126.443-.05.887-.09 1.325-.173.182-.035.358-.088.528-.16.067-.03.096-.082.095-.156-.002-2.09-.002-4.18-.002-6.27 0-.048.003-.096.01-.143.01-.064.044-.09.11-.078.164.03.328.054.492.084l2.296.402c1.282.223 2.564.447 3.846.67.166.03.333.054.498.087.058.013.09.048.09.108.003.166.01.332.01.498v6.074z" />
  </svg>
)

// Instagram Icon
export const InstagramIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)

// YouTube Icon
export const YouTubeIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

// SoundCloud Icon
export const SoundCloudIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c0 .055.045.094.09.094s.089-.045.104-.104l.21-1.319-.21-1.334c0-.061-.044-.09-.09-.09m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.12.119.12.061 0 .105-.061.121-.12l.254-2.474-.254-2.548c-.016-.06-.061-.12-.121-.12m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.15l.24-2.532-.24-2.623c0-.075-.06-.135-.135-.135l-.031-.017zm1.155.36c-.005-.09-.075-.149-.159-.149-.09 0-.158.06-.164.149l-.217 2.43.2 2.563c0 .09.075.157.159.157.074 0 .148-.068.148-.158l.227-2.563-.227-2.444.033.015zm.809-1.709c-.101 0-.18.09-.18.181l-.21 3.957.187 2.563c0 .09.08.164.18.164.094 0 .174-.09.18-.18l.209-2.563-.209-3.972c-.008-.104-.088-.18-.18-.18m.959-.914c-.105 0-.195.09-.203.194l-.18 4.872.165 2.548c0 .12.09.209.195.209.104 0 .194-.089.21-.209l.193-2.548-.192-4.856c-.016-.12-.105-.21-.21-.21m.989-.449c-.121 0-.211.089-.225.209l-.165 5.275.165 2.52c.014.119.104.225.225.225.119 0 .225-.105.225-.225l.195-2.52-.196-5.275c0-.12-.105-.225-.225-.225m1.245.045c0-.135-.105-.24-.24-.24-.119 0-.24.105-.24.24l-.149 5.441.149 2.503c.016.135.121.24.256.24s.24-.105.24-.24l.164-2.503-.164-5.456-.016.015zm.749-.134c-.135 0-.255.119-.255.254l-.15 5.322.15 2.473c0 .15.12.255.255.255s.255-.12.255-.27l.15-2.474-.165-5.307c0-.148-.12-.27-.271-.27m1.005.166c-.164 0-.284.135-.284.285l-.103 5.143.135 2.474c0 .149.119.277.284.277.149 0 .271-.12.284-.285l.121-2.443-.135-5.112c-.012-.164-.135-.285-.285-.285m1.184-.166c-.18 0-.314.149-.314.314l-.093 5.12.093 2.427c0 .165.134.314.314.314.165 0 .3-.149.314-.33l.12-2.426-.12-5.105c-.015-.18-.149-.314-.314-.314m1.199-.135c-.195 0-.345.149-.36.33l-.075 5.09.075 2.412c.016.195.165.345.36.345.18 0 .33-.165.345-.36l.09-2.412-.09-5.09c-.015-.181-.165-.345-.345-.345m1.215-.104c-.21 0-.375.165-.375.359l-.075 5.18.075 2.37c.015.21.165.36.375.36.194 0 .36-.165.374-.375l.09-2.37-.104-5.165c0-.21-.165-.375-.375-.375m1.17.135c-.21 0-.36.15-.375.345l-.09 5.115.09 2.355c.014.21.164.375.375.375.194 0 .36-.165.375-.375l.09-2.355-.09-5.115c-.016-.195-.166-.36-.376-.36m2.056-.12c-.029-.18-.149-.3-.314-.3-.181 0-.301.12-.329.3l-.106 5.195.106 2.355c.029.18.149.3.33.3.165 0 .285-.12.313-.314l.12-2.34-.12-5.195zm.615-3.78c-.391 0-.735.165-.989.435-.105.029-.196.135-.196.284v7.66c0 .151.105.285.254.3h5.173c1.41 0 2.551-1.14 2.551-2.55 0-1.41-1.14-2.55-2.55-2.55-.435 0-.855.119-1.214.314-.255-1.784-1.801-3.149-3.66-3.149-.195 0-.39.016-.584.045l.215.211z" />
  </svg>
)

// Facebook Icon
export const FacebookIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

// Twitter/X Icon
export const TwitterIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Bandcamp Icon
export const BandcampIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z" />
  </svg>
)

// Website/Globe Icon
export const WebsiteIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

// Type for social links data (supports both flat fields and nested object)
export interface SocialLinksData {
  // Flat field names (from database)
  website_url?: string | null
  instagram_handle?: string | null
  tiktok_handle?: string | null
  youtube_url?: string | null
  spotify_url?: string | null
  apple_music_url?: string | null
  soundcloud_url?: string | null
  facebook_url?: string | null
  twitter_url?: string | null
  bandcamp_url?: string | null
  // Nested object (from types)
  social_links?: {
    website?: string | null
    instagram?: string | null
    tiktok?: string | null
    youtube?: string | null
    spotify?: string | null
    apple_music?: string | null
    soundcloud?: string | null
    facebook?: string | null
    twitter?: string | null
    bandcamp?: string | null
  }
}

// Platform configuration
const PLATFORMS = [
  { key: 'tiktok', flatKey: 'tiktok_handle', nestedKey: 'tiktok', Icon: TikTokIcon, label: 'TikTok' },
  { key: 'spotify', flatKey: 'spotify_url', nestedKey: 'spotify', Icon: SpotifyIcon, label: 'Spotify' },
  { key: 'apple_music', flatKey: 'apple_music_url', nestedKey: 'apple_music', Icon: AppleMusicIcon, label: 'Apple Music' },
  { key: 'instagram', flatKey: 'instagram_handle', nestedKey: 'instagram', Icon: InstagramIcon, label: 'Instagram' },
  { key: 'youtube', flatKey: 'youtube_url', nestedKey: 'youtube', Icon: YouTubeIcon, label: 'YouTube' },
  { key: 'soundcloud', flatKey: 'soundcloud_url', nestedKey: 'soundcloud', Icon: SoundCloudIcon, label: 'SoundCloud' },
  { key: 'facebook', flatKey: 'facebook_url', nestedKey: 'facebook', Icon: FacebookIcon, label: 'Facebook' },
  { key: 'twitter', flatKey: 'twitter_url', nestedKey: 'twitter', Icon: TwitterIcon, label: 'Twitter/X' },
  { key: 'bandcamp', flatKey: 'bandcamp_url', nestedKey: 'bandcamp', Icon: BandcampIcon, label: 'Bandcamp' },
  { key: 'website', flatKey: 'website_url', nestedKey: 'website', Icon: WebsiteIcon, label: 'Website' },
] as const

// Helper to normalize URL (add https:// if missing)
function normalizeUrl(url: string): string {
  if (!url) return url
  // For Instagram/TikTok handles, convert to full URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Check if it looks like a handle (no dots or slashes)
    if (!url.includes('.') && !url.includes('/')) {
      return url // Return as-is, will be handled by platform-specific logic
    }
    return `https://${url}`
  }
  return url
}

// Helper to get platform URL from handle
function getPlatformUrl(platform: string, value: string): string {
  if (!value) return ''
  
  // If it's already a full URL, return it
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }
  
  // Convert handle to full URL for specific platforms
  const handle = value.replace(/^@/, '') // Remove @ prefix if present
  
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${handle}`
    case 'tiktok':
      return `https://tiktok.com/@${handle}`
    case 'twitter':
      return `https://x.com/${handle}`
    case 'facebook':
      return `https://facebook.com/${handle}`
    case 'youtube':
      return value.includes('youtube.com') || value.includes('youtu.be') 
        ? normalizeUrl(value) 
        : `https://youtube.com/@${handle}`
    default:
      return normalizeUrl(value)
  }
}

interface SocialLinksBarProps {
  data: SocialLinksData
  className?: string
  iconClassName?: string
}

/**
 * SocialLinksBar - Displays clickable social platform icons
 * Supports both flat fields (from DB) and nested social_links object
 */
export function SocialLinksBar({ data, className = '', iconClassName = '' }: SocialLinksBarProps) {
  // Get URL for a platform, checking both flat and nested formats
  const getUrl = (flatKey: string, nestedKey: string): string | null => {
    // Check flat field first (direct from DB)
    const flatValue = (data as Record<string, unknown>)[flatKey] as string | null | undefined
    if (flatValue) {
      return getPlatformUrl(nestedKey, flatValue)
    }
    
    // Check nested social_links object
    const nestedValue = data.social_links?.[nestedKey as keyof typeof data.social_links]
    if (nestedValue) {
      return getPlatformUrl(nestedKey, nestedValue)
    }
    
    return null
  }

  // Filter to only platforms with URLs
  const availablePlatforms = PLATFORMS.filter(({ flatKey, nestedKey }) => getUrl(flatKey, nestedKey))

  if (availablePlatforms.length === 0) {
    return null
  }

  return (
    <div className={`flex gap-3 ${className}`}>
      {availablePlatforms.map(({ key, flatKey, nestedKey, Icon, label }) => {
        const url = getUrl(flatKey, nestedKey)
        if (!url) return null

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80 ${iconClassName}`}
            title={label}
            aria-label={`Visit ${label} profile`}
          >
            <Icon />
          </a>
        )
      })}
    </div>
  )
}

export default SocialLinksBar

