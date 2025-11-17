import { Helmet } from 'react-helmet-async'

interface MetaTagsProps {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url: string
  type?: 'website' | 'profile' | 'article'
  noIndex?: boolean
}

/**
 * MetaTags component for SEO optimization
 * Adds title, description, Open Graph tags, Twitter Card tags, and canonical URL
 */
export function MetaTags({
  title,
  description,
  keywords = [],
  image = '/og-image.png',
  url,
  type = 'website',
  noIndex = false,
}: MetaTagsProps) {
  // Construct full title with site name
  const fullTitle = title.includes('Umbrella') ? title : `${title} - Umbrella`

  // Construct full URL for canonical and OG tags
  const canonicalUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`

  // Construct full image URL for OG tags
  const imageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots Meta Tag */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Umbrella" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  )
}
