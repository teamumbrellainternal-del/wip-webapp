export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API endpoints
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Everything else goes to assets (SPA)
    return env.ASSETS.fetch(request);
  }
};
