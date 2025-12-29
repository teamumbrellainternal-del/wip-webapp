/**
 * JSON-LD Structured Data Component
 * Provides Schema.org markup for SEO and rich search results
 * 
 * @see https://schema.org/MusicGroup for artist schema
 * @see https://schema.org/LocalBusiness for venue schema
 */

import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://app.umbrellalive.com'

/**
 * Artist profile data for JSON-LD
 */
interface ArtistJsonLdProps {
  type: 'artist'
  id: string
  name: string
  description?: string | null
  image?: string | null
  genre?: string | null
  location?: string | null
  socialLinks?: {
    instagram?: string | null
    spotify?: string | null
    youtube?: string | null
    soundcloud?: string | null
    website?: string | null
    facebook?: string | null
    twitter?: string | null
    tiktok?: string | null
  }
}

/**
 * Venue profile data for JSON-LD
 */
interface VenueJsonLdProps {
  type: 'venue'
  id: string
  name: string
  description?: string | null
  image?: string | null
  venueType?: string | null
  city: string
  state?: string | null
  capacity?: number | null
}

type JsonLdProps = ArtistJsonLdProps | VenueJsonLdProps

/**
 * Generate absolute URL for images
 */
function getAbsoluteImageUrl(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined
  if (imageUrl.startsWith('http')) return imageUrl
  return `${BASE_URL}${imageUrl}`
}

/**
 * Generate JSON-LD for artist (MusicGroup schema)
 */
function generateArtistJsonLd(props: ArtistJsonLdProps): object {
  const sameAs: string[] = []
  
  if (props.socialLinks) {
    if (props.socialLinks.instagram) {
      sameAs.push(`https://instagram.com/${props.socialLinks.instagram.replace('@', '')}`)
    }
    if (props.socialLinks.spotify) {
      sameAs.push(props.socialLinks.spotify)
    }
    if (props.socialLinks.youtube) {
      sameAs.push(props.socialLinks.youtube)
    }
    if (props.socialLinks.soundcloud) {
      sameAs.push(props.socialLinks.soundcloud)
    }
    if (props.socialLinks.website) {
      sameAs.push(props.socialLinks.website)
    }
    if (props.socialLinks.facebook) {
      sameAs.push(props.socialLinks.facebook)
    }
    if (props.socialLinks.twitter) {
      sameAs.push(props.socialLinks.twitter)
    }
    if (props.socialLinks.tiktok) {
      sameAs.push(`https://tiktok.com/@${props.socialLinks.tiktok.replace('@', '')}`)
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': `${BASE_URL}/artist/${props.id}`,
    name: props.name,
    url: `${BASE_URL}/artist/${props.id}`,
    ...(props.description && { description: props.description }),
    ...(props.image && { image: getAbsoluteImageUrl(props.image) }),
    ...(props.genre && { genre: props.genre }),
    ...(props.location && {
      location: {
        '@type': 'Place',
        name: props.location,
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  }
}

/**
 * Generate JSON-LD for venue (LocalBusiness schema)
 */
function generateVenueJsonLd(props: VenueJsonLdProps): object {
  // Map venue types to Schema.org business types
  const venueTypeToSchemaType: Record<string, string> = {
    bar: 'BarOrPub',
    club: 'NightClub',
    concert_hall: 'MusicVenue',
    theater: 'PerformingArtsTheater',
    restaurant: 'Restaurant',
    hotel: 'Hotel',
    outdoor: 'EventVenue',
    festival: 'Festival',
    private_venue: 'EventVenue',
    other: 'EventVenue',
  }

  const schemaType = props.venueType 
    ? venueTypeToSchemaType[props.venueType] || 'MusicVenue'
    : 'MusicVenue'

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': `${BASE_URL}/venue/${props.id}`,
    name: props.name,
    url: `${BASE_URL}/venue/${props.id}`,
    ...(props.description && { description: props.description }),
    ...(props.image && { image: getAbsoluteImageUrl(props.image) }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: props.city,
      ...(props.state && { addressRegion: props.state }),
      addressCountry: 'US',
    },
    ...(props.capacity && {
      maximumAttendeeCapacity: props.capacity,
    }),
  }
}

/**
 * JSON-LD Component
 * Injects structured data into page head for SEO
 */
export function JsonLd(props: JsonLdProps) {
  const jsonLd = props.type === 'artist'
    ? generateArtistJsonLd(props)
    : generateVenueJsonLd(props)

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  )
}

/**
 * Artist-specific JSON-LD component with simpler props
 */
export function ArtistJsonLd({
  id,
  name,
  description,
  image,
  genre,
  location,
  instagramHandle,
  spotifyUrl,
  youtubeUrl,
  soundcloudUrl,
  websiteUrl,
  facebookUrl,
  twitterUrl,
  tiktokHandle,
}: {
  id: string
  name: string
  description?: string | null
  image?: string | null
  genre?: string | null
  location?: string | null
  instagramHandle?: string | null
  spotifyUrl?: string | null
  youtubeUrl?: string | null
  soundcloudUrl?: string | null
  websiteUrl?: string | null
  facebookUrl?: string | null
  twitterUrl?: string | null
  tiktokHandle?: string | null
}) {
  return (
    <JsonLd
      type="artist"
      id={id}
      name={name}
      description={description}
      image={image}
      genre={genre}
      location={location}
      socialLinks={{
        instagram: instagramHandle,
        spotify: spotifyUrl,
        youtube: youtubeUrl,
        soundcloud: soundcloudUrl,
        website: websiteUrl,
        facebook: facebookUrl,
        twitter: twitterUrl,
        tiktok: tiktokHandle,
      }}
    />
  )
}

/**
 * Venue-specific JSON-LD component with simpler props
 */
export function VenueJsonLd({
  id,
  name,
  description,
  image,
  venueType,
  city,
  state,
  capacity,
}: {
  id: string
  name: string
  description?: string | null
  image?: string | null
  venueType?: string | null
  city: string
  state?: string | null
  capacity?: number | null
}) {
  return (
    <JsonLd
      type="venue"
      id={id}
      name={name}
      description={description}
      image={image}
      venueType={venueType}
      city={city}
      state={state}
      capacity={capacity}
    />
  )
}

export default JsonLd

