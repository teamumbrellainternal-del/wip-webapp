/**
 * Minimal Worker script for API routes
 * Handles health check and future API endpoints
 */

export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle health check endpoint
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'openwebui-config-tool',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: 'production'
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }
    
    // Handle API routes (future expansion)
    if (url.pathname.startsWith('/api/')) {
      // Add API route handlers here as needed
      return new Response(JSON.stringify({
        error: 'API endpoint not implemented'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For all other requests, let the assets handler take over
    // This will serve the SPA and handle client-side routing
    return env.ASSETS.fetch(request);
  },
};
