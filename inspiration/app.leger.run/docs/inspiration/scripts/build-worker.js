#!/usr/bin/env node

/**
 * Post-build script to generate _worker.js for Cloudflare Workers
 * Run this after vite build to create the worker file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerContent = `// Auto-generated Cloudflare Worker for SPA
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle API routes
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
    
    // For all other routes, serve the SPA
    return env.ASSETS.fetch(request);
  }
};`;

// Ensure dist directory exists
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory not found. Run vite build first.');
  process.exit(1);
}

// Write _worker.js
const workerPath = path.join(distDir, '_worker.js');
fs.writeFileSync(workerPath, workerContent);

console.log('✅ Created dist/_worker.js for Cloudflare Workers');
