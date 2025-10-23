### What Each File Provides:

**wrangler.toml** → CF Workers SPA routing pattern with `[assets]` configuration
**vite.config.ts** → Build optimization (code splitting, chunks, minification)
**package.json** → Dependency versions and build scripts proven to work
**tailwind.config.js** → Catppuccin Mocha theme + brand-specific customizations
**index.css** → CSS variable system for theming
**api/index.ts** → Worker entry point pattern for API + SPA serving
**scripts/build-worker.js** → Automated worker bundling

---

# Vite + Cloudflare Workers: Production SPA Infrastructure

**Purpose**: Complete guide for building and deploying React SPAs on Cloudflare Workers using Vite, optimized for edge deployment and client-side routing.

**Audience**: Developers implementing the Leger frontend web application.

**Scope**: Build tooling, deployment configuration, asset optimization, and worker setup - NOT component libraries or business logic.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Vite Configuration](#vite-configuration)
3. [Cloudflare Workers Setup](#cloudflare-workers-setup)
4. [TypeScript Configuration](#typescript-configuration)
5. [Tailwind CSS Integration](#tailwind-css-integration)
6. [Build Process](#build-process)
7. [Asset Optimization](#asset-optimization)
8. [Routing & SPA Support](#routing--spa-support)
9. [Development Workflow](#development-workflow)
10. [Deployment Pipeline](#deployment-pipeline)

---

## Architecture Overview

### Edge-Deployed SPA Pattern

```
Browser Request
     ↓
Cloudflare Edge (300+ locations)
     ↓
Worker (api/index.ts)
     ↓
  ┌──────────────────┐
  │ Path check       │
  └──────────────────┘
     ↓           ↓
  /api/*     Everything else
     ↓           ↓
  API Logic   ASSETS.fetch()
              ↓
          Serve SPA (index.html + chunks)
```

**Key Characteristics**:
- Zero cold start (Workers are pre-warmed)
- Global edge distribution (< 50ms latency worldwide)
- Client-side routing with SPA fallback
- API and static assets from same domain (no CORS)
- Automatic HTTPS and HTTP/2

### File Output Structure

```
dist/
├── index.html              # Entry point
├── assets/
│   ├── index-[hash].js    # Main bundle
│   ├── vendor-[hash].js   # React + React DOM
│   ├── rjsf-[hash].js     # Form library
│   ├── ui-[hash].js       # UI components
│   ├── form-[hash].js     # Form utilities
│   ├── utils-[hash].js    # Utility functions
│   └── index-[hash].css   # Styles
└── [other static assets]
```

**Benefits**:
- Content-addressed (cache-friendly)
- Parallel loading of chunks
- Tree shaking eliminates unused code
- Optimal bundle sizing

---

## Vite Configuration

### Complete vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    target: 'esnext',
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false,
    
    rollupOptions: {
      output: {
        // Manual chunking for optimal loading
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'], // Add for Leger
          'rjsf': ['@rjsf/core', '@rjsf/validator-ajv8'],
          'ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-toast'
          ],
          'form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'lucide-react']
        },
        
        // Content-addressed filenames
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    
    // Asset handling
    assetsInlineLimit: 4096,           // Inline assets < 4KB
    chunkSizeWarningLimit: 1000,       // Warn if chunk > 1MB
    cssCodeSplit: true,                 // Split CSS per chunk
    reportCompressedSize: true,         // Report gzip sizes
    cssMinify: true,                    // Minify CSS
  },
  
  server: {
    port: 3000,
    host: true,                         // Listen on all interfaces
    open: false,                        // Don't auto-open browser
    cors: true                          // Enable CORS for dev
  },
  
  preview: {
    port: 3001,
    host: true,
    cors: true
  },
  
  esbuild: {
    legalComments: 'none',              // Remove legal comments
    logOverride: {
      'this-is-undefined-in-esm': 'silent'
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', '@rjsf/core', '@rjsf/validator-ajv8'],
    exclude: ['@cloudflare/workers-types']
  }
})
```

### Key Configuration Decisions

**Manual Chunking Strategy**:
- **vendor chunk**: Core React libraries (changes infrequently)
- **rjsf chunk**: Form engine (large, specialized)
- **ui chunk**: Radix UI primitives (shared across app)
- **form chunk**: Form utilities (react-hook-form + validation)
- **utils chunk**: Small utilities (changes frequently)

**Rationale**: Separate chunks that change at different rates for optimal cache utilization.

**Build Target: `esnext`**:
- Modern browsers only (ES2020+)
- Smaller bundle sizes
- Faster execution
- No legacy polyfills needed

**Minification: `esbuild`**:
- Faster than Terser
- Sufficient for most use cases
- Integrated with Vite

---

## Cloudflare Workers Setup

### wrangler.toml Configuration

```toml
name = "leger-app"
compatibility_date = "2025-04-01"
main = "src/worker.js"

[assets]
directory = "./dist"
binding = "ASSETS"
not_found_handling = "single-page-application"

# Environment-specific configurations
[env.production]
name = "leger-app"
vars = { ENVIRONMENT = "production" }

[env.staging]
name = "leger-app-staging"
vars = { ENVIRONMENT = "staging" }

[env.development]
name = "leger-app-dev"
vars = { ENVIRONMENT = "development" }

# Placement optimization
[placement]
mode = "smart"
```

**Key Settings**:

**`not_found_handling = "single-page-application"`**:
- Critical for client-side routing
- Any 404 serves `index.html`
- React Router handles route matching

**`[placement] mode = "smart"`**:
- Cloudflare automatically optimizes worker placement
- Reduces latency by placing near users
- No manual region configuration needed

### Worker Implementation (TypeScript)

```typescript
// api/index.ts
export interface Env {
  ASSETS: Fetcher;
  // Add as Leger grows:
  // LEGER_USERS: KVNamespace;
  // LEGER_SECRETS: KVNamespace;
  // LEGER_DB: D1Database;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    
    // Health check endpoint (for monitoring)
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'leger-app',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.ENVIRONMENT || 'unknown'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }
    
    // API routes (future expansion)
    if (url.pathname.startsWith('/api/')) {
      // TODO: Add authentication check
      // const authHeader = request.headers.get('Authorization');
      // if (!authHeader) {
      //   return new Response('Unauthorized', { status: 401 });
      // }
      
      // TODO: Route to appropriate API handler
      return new Response(JSON.stringify({
        error: 'API endpoint not implemented'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Serve SPA assets for everything else
    // This handles both:
    // 1. Actual static files (JS, CSS, images)
    // 2. Client-side routes (React Router paths)
    return env.ASSETS.fetch(request);
  },
};
```

**Worker Responsibilities**:
1. Health check endpoint (monitoring)
2. API route handling (authentication + business logic)
3. SPA asset serving (fallback to index.html)

**Performance Note**: Workers execute in < 1ms on average, adding negligible latency.

---

## TypeScript Configuration

### tsconfig.json (Application)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json (Build Scripts)

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "scripts/**/*.ts"]
}
```

**Key Features**:
- Strict type checking for safety
- Path aliases for clean imports (`@/components/...`)
- Project references for build script typing
- No unused variable errors (disabled for flexibility)

---

## Tailwind CSS Integration

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // CSS variable-based theming
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          'Geist Sans',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'ui-monospace',
          'monospace',
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Theming Approach**:
- CSS variables defined in `index.css`
- Tailwind utilities reference variables
- Supports light/dark mode via class toggle
- Brand colors centralized in variables

---

## Build Process

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build && npm run build:worker",
    "build:worker": "node scripts/build-worker.js",
    "preview": "vite preview",
    "deploy": "npm run build && wrangler deploy",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  }
}
```

### Worker Build Script

```javascript
// scripts/build-worker.js
import * as esbuild from 'esbuild';
import { copyFileSync } from 'fs';

// Build worker entry point
await esbuild.build({
  entryPoints: ['./src/worker.js'],
  bundle: true,
  format: 'esm',
  target: 'es2020',
  outfile: './dist/_worker.js',
  platform: 'neutral',
  minify: true,
  sourcemap: false,
});

console.log('✓ Worker built successfully');
```

**Why Separate Worker Build**:
- Worker code different from client code
- No React dependencies in worker
- Optimized for edge runtime
- Smaller worker bundle (faster cold starts)

### Build Workflow

```bash
npm run build
  ↓
1. vite build              # Build SPA (React app)
   └─ Output: dist/
  ↓
2. build:worker           # Build worker entry
   └─ Output: dist/_worker.js
  ↓
3. wrangler deploy        # Deploy to CF Workers
   └─ Uploads: dist/ → Cloudflare
```

---

## Asset Optimization

### Automatic Optimizations

Vite applies these by default:

**1. Tree Shaking**:
- Removes unused exports
- Dead code elimination
- Reduces bundle size by 30-50%

**2. Code Splitting**:
- Route-based splitting (with React Router)
- Dynamic imports create separate chunks
- Parallel loading of routes

**3. Minification**:
- esbuild minifies JS (faster than Terser)
- CSS minified separately
- HTML minified

**4. Compression**:
- Cloudflare automatically gzips/brotli
- No manual compression needed
- ~70% size reduction

### Image Optimization

**Recommended Approach**:
```typescript
// Use WebP format
import logo from '@/assets/logo.webp';

// Or SVG for icons/logos
import icon from '@/assets/icon.svg';

// Vite converts to optimized format automatically
```

**Best Practices**:
- Use WebP for photos (70% smaller than JPEG)
- Use SVG for icons/logos (scalable, tiny)
- Lazy load images below fold
- Set explicit width/height (prevent layout shift)

### Font Loading

```typescript
// main.tsx
const loadFonts = () => {
  // Option 1: CDN (simplest, but slower)
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
  document.head.appendChild(link);
};

// Option 2: Self-hosted (faster, recommended)
// Install: npm install @fontsource/inter
// Import in index.css:
// @import '@fontsource/inter/400.css';
// @import '@fontsource/inter/500.css';
// @import '@fontsource/inter/600.css';
```

**Performance Note**: Self-hosted fonts load faster (no DNS lookup, same domain).

---

## Routing & SPA Support

### Client-Side Routing Setup

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/api-keys" />} />
        <Route path="/api-keys" element={<ApiKeysPage />} />
        <Route path="/releases" element={<ReleasesListPage />} />
        <Route path="/releases/new" element={<ReleaseEditPage />} />
        <Route path="/releases/:id" element={<ReleaseEditPage />} />
        <Route path="/releases/:id/settings" element={<ReleaseSettingsPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Worker SPA Fallback

The `not_found_handling = "single-page-application"` setting ensures:

1. User navigates to `/releases/abc123`
2. Worker receives request
3. Path doesn't exist as static file
4. Worker serves `index.html` (200 status)
5. React Router mounts
6. Router matches `/releases/:id` route
7. Correct page renders

**Critical**: All routes must work on direct access (not just after client-side navigation).

---

## Development Workflow

### Local Development

```bash
# Start dev server
npm run dev

# Vite serves on http://localhost:3000
# Hot module replacement (HMR) enabled
# Changes reflect instantly
```

**Dev Server Features**:
- Instant HMR (< 50ms update time)
- No build step (transforms on-demand)
- Source maps for debugging
- CSS modules support

### Testing Production Build Locally

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Serves on http://localhost:3001
# Mimics production environment
# Test before deployment
```

### Environment Variables

```typescript
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

```bash
# .env.local (not committed)
VITE_API_BASE_URL=http://localhost:8787
VITE_APP_VERSION=1.0.0
```

**Usage**:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

**Security Note**: Only variables prefixed with `VITE_` are exposed to client code.

---

## Deployment Pipeline

### Manual Deployment

```bash
# 1. Build production assets
npm run build

# 2. Deploy to Cloudflare
wrangler deploy

# Output:
# ✓ Built successfully
# ✓ Uploading...
# ✓ Deployed to https://leger-app.workers.dev
```

### Environment-Specific Deployment

```bash
# Deploy to staging
wrangler deploy --env staging

# Deploy to production
wrangler deploy --env production
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
```

**Deployment Flow**:
1. Push to GitHub
2. GitHub Actions triggers
3. Install dependencies
4. Run type check + lint
5. Build application
6. Deploy to Cloudflare
7. Available globally in ~30 seconds

---

## Performance Optimization

### Lighthouse Scores (Target)

- **Performance**: 95-100
- **Accessibility**: 95-100
- **Best Practices**: 95-100
- **SEO**: 90-100

### Optimization Checklist

**Build-Time**:
- ✅ Code splitting (manual chunks)
- ✅ Tree shaking (automatic)
- ✅ Minification (esbuild)
- ✅ CSS purging (Tailwind JIT)

**Runtime**:
- ✅ Lazy loading (React.lazy)
- ✅ Memoization (React.memo, useMemo)
- ✅ Virtual scrolling (for large lists)
- ✅ Debounced inputs (search, validation)

**Network**:
- ✅ HTTP/2 push (Cloudflare automatic)
- ✅ Compression (gzip/brotli automatic)
- ✅ CDN caching (Cloudflare edge)
- ✅ Asset hashing (cache busting)

### Bundle Analysis

```bash
# Add to package.json
"analyze": "vite build --mode analyze"

# Install plugin
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react(),
  visualizer({
    open: true,
    gzipSize: true,
    brotliSize: true,
  }),
]
```

Generates interactive bundle visualization showing:
- Chunk sizes
- Import relationships
- Largest dependencies
- Optimization opportunities

---

## Troubleshooting

### Common Issues

**Issue**: `ReferenceError: process is not defined`
**Cause**: Node.js-specific code in browser
**Fix**: Check for Node.js imports, use browser-compatible alternatives

**Issue**: Routes 404 on refresh
**Cause**: SPA fallback not configured
**Fix**: Verify `wrangler.toml` has `not_found_handling = "single-page-application"`

**Issue**: Large initial bundle size
**Cause**: Missing code splitting
**Fix**: Use dynamic imports for routes:
```typescript
const ReleasesPage = React.lazy(() => import('./pages/ReleasesPage'));
```

**Issue**: Slow build times
**Cause**: Too many dependencies or large files
**Fix**: Use bundle analyzer, remove unused deps

---

## Best Practices Summary

### Build Configuration
✅ Use manual chunking for vendor separation
✅ Enable CSS code splitting
✅ Configure proper asset inlining threshold
✅ Set realistic chunk size warnings

### Worker Setup
✅ Keep worker code minimal
✅ Separate API logic from asset serving
✅ Use SPA fallback for client routing
✅ Include health check endpoint

### Asset Management
✅ Use content-addressed filenames
✅ Optimize images before commit
✅ Self-host fonts when possible
✅ Lazy load below-fold content

### Development Workflow
✅ Type check before deploy
✅ Lint code automatically
✅ Test production builds locally
✅ Use environment-specific configs

### Deployment
✅ Automate via CI/CD
✅ Deploy to staging first
✅ Monitor bundle sizes
✅ Track performance metrics

---

## Next Steps

1. **Copy inspiration files** from openwebui-config to `/inspiration` subdirectory
2. **Review configurations** and adapt for Leger-specific needs
3. **Set up base project structure** with these build tools
4. **Add React Router** for multi-page navigation
5. **Implement authentication** before API routes
6. **Add monitoring** (Sentry, LogRocket, or similar)
7. **Configure CI/CD** for automated deployments

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Version**: 1.0  
**Last Updated**: October 2025  
**Status**: Production-Ready Reference
