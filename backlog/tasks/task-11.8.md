---
id: task-11.8
title: "SEO Meta Tags"
status: "To Do"
assignee: []
created_date: "2025-11-17"
labels: ["frontend", "P1", "seo"]
milestone: "M11 - Pre-Launch Readiness & Compliance"
dependencies: []
estimated_hours: 3
---

## Description
Add SEO meta tags and Open Graph tags to all public pages for search engine discoverability and social media sharing.

## Acceptance Criteria
- [ ] MetaTags component created with title, description, keywords, image, URL props
- [ ] Applied to all public pages (login, marketplace, artist profiles)
- [ ] Each page has unique title and description
- [ ] Open Graph tags for social sharing (og:title, og:description, og:image, og:url, og:type)
- [ ] Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
- [ ] Canonical URL set on all pages
- [ ] Robot meta tags configured (index/follow for public, noindex for auth/settings)
- [ ] Default OG image created (1200x630px) with Umbrella branding
- [ ] Verified with Google Rich Results Test and Facebook Debugger

## Implementation Plan
1. Create MetaTags.tsx component:
   ```typescript
   interface MetaTagsProps {
     title: string;
     description: string;
     keywords?: string[];
     image?: string;
     url: string;
     type?: 'website' | 'profile' | 'article';
     noIndex?: boolean;
   }
   ```
2. Use react-helmet-async or next/head for meta injection
3. Set all meta tags: title, description, keywords, OG tags, Twitter Card tags, canonical URL
4. Add to key pages:
   - Login: "Log In - Umbrella", noIndex: true
   - Marketplace: "Find Gigs & Discover Artists - Umbrella", keywords: "music gigs, artist marketplace"
   - Artist profiles: "{Artist Name} - Umbrella", dynamic description from bio
   - Dashboard: "Dashboard - Umbrella", noIndex: true
5. Create default OG image:
   - 1200x630px branded image
   - Umbrella logo + tagline
   - Upload to R2 or CDN
6. Set default meta tags:
   - Title: "Umbrella - Platform for Independent Artists"
   - Description: "Connect independent artists with gigs, tools, and opportunities"
   - Keywords: "independent artists, music platform, gig marketplace"
7. Test with tools:
   - Google Rich Results Test
   - Facebook Debugger
   - Twitter Card Validator
8. Verify canonical URLs correct

## Notes & Comments
**Priority:** P1 - Important for growth (not launch blocking but important for organic discovery)

**Files to Create:**
- src/components/MetaTags.tsx

**Files to Modify:**
- All page components (add MetaTags)

**OG Image:** Create 1200x630px with Umbrella logo, tagline, brand colors. Works well as thumbnail.

**Canonical URLs:** Always set to prevent duplicate content issues. Tells search engines which URL is "official."

