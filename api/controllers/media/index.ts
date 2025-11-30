/**
 * Media controller
 * Serves files from R2 storage
 * 
 * Features:
 * - Serve profile avatars, banners, and other media files
 * - Proper Content-Type headers based on file metadata
 * - Cache headers for performance
 * - 404 handling for missing files
 */

import type { RouteHandler } from '../../router'
import { errorResponse } from '../../utils/response'
import { ErrorCodes } from '../../utils/error-codes'
import { logger } from '../../utils/logger'

/**
 * Serve file from R2 storage
 * GET /media/*
 * 
 * Extracts the file key from the URL path and returns the file from R2
 * with appropriate Content-Type and cache headers.
 */
export const serveFile: RouteHandler = async (ctx) => {
  // Check if R2 storage is configured
  if (!ctx.env.BUCKET) {
    return errorResponse(
      ErrorCodes.SERVICE_UNAVAILABLE,
      'File storage is not configured',
      503,
      undefined,
      ctx.requestId
    )
  }

  try {
    // Extract file key from URL path (everything after /media/)
    const urlPath = ctx.url.pathname
    const key = urlPath.replace(/^\/media\//, '')

    if (!key) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'File path is required',
        400,
        undefined,
        ctx.requestId
      )
    }

    logger.info('📁 Serving file from R2:', { key })

    // Get file from R2
    const object = await ctx.env.BUCKET.get(key)

    if (!object) {
      logger.warn('📁 File not found in R2:', { key })
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'File not found',
        404,
        undefined,
        ctx.requestId
      )
    }

    // Determine Content-Type from stored metadata or file extension
    let contentType = object.httpMetadata?.contentType || 'application/octet-stream'

    // Fallback: derive from file extension if not set
    if (contentType === 'application/octet-stream') {
      const ext = key.split('.').pop()?.toLowerCase()
      const mimeTypes: Record<string, string> = {
        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        'gif': 'image/gif',
        'heic': 'image/heic',
        // Audio
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'flac': 'audio/flac',
        'm4a': 'audio/x-m4a',
        'aac': 'audio/aac',
        'ogg': 'audio/ogg',
        // Video
        'mp4': 'video/mp4',
        'mov': 'video/quicktime',
        'webm': 'video/webm',
        'avi': 'video/x-msvideo',
        // Documents
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'md': 'text/markdown',
        'csv': 'text/csv',
      }
      contentType = (ext && mimeTypes[ext]) || contentType
    }

    // Build response headers
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Length', object.size.toString())

    // Set Content-Disposition to inline for viewable content types
    // This tells the browser to display the content rather than download it
    const viewableTypes = [
      'image/', 'video/', 'audio/', 'application/pdf', 'text/'
    ]
    const isViewable = viewableTypes.some(type => contentType.startsWith(type))
    headers.set('Content-Disposition', isViewable ? 'inline' : 'attachment')

    // For PDFs and text files that need to be displayed in iframes,
    // override the global CSP to allow framing from same origin
    const iframeTypes = ['application/pdf', 'text/']
    const needsIframe = iframeTypes.some(type => contentType.startsWith(type))
    if (needsIframe) {
      // Allow this content to be framed by our app
      headers.set('X-Frame-Options', 'SAMEORIGIN')
      // Remove restrictive CSP for iframe-viewable content
      headers.set('Content-Security-Policy', "frame-ancestors 'self'")
    }

    // Cache headers for performance
    // Avatars and media can be cached for 1 hour, with revalidation
    headers.set('Cache-Control', 'public, max-age=3600, must-revalidate')

    // ETag for cache validation
    if (object.etag) {
      headers.set('ETag', object.etag)
    }

    // Check If-None-Match for 304 response
    const ifNoneMatch = ctx.request.headers.get('If-None-Match')
    if (ifNoneMatch && object.etag && ifNoneMatch === object.etag) {
      return new Response(null, {
        status: 304,
        headers,
      })
    }

    logger.info('📁 Serving file:', {
      key,
      size: object.size,
      contentType
    })

    // Return the file
    return new Response(object.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    logger.error('❌ Error serving file from R2:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to serve file',
      500,
      undefined,
      ctx.requestId
    )
  }
}

