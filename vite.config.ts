import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, mkdirSync, readdirSync } from 'fs'

// Helper to recursively copy directory
function copyDirRecursive(src: string, dest: string) {
  mkdirSync(dest, { recursive: true })
  const entries = readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

export default defineConfig({
  // base: '/wip-webapp/', // Commented out - app is deployed at root domain
  plugins: [
    react(),
    {
      name: 'copy-brand-distribution',
      writeBundle() {
        console.log('📦 Copying brand distribution to dist...')

        // Copy fonts, tokens, and all brand assets
        copyDirRecursive(
          path.resolve(__dirname, 'brand/dist'),
          path.resolve(__dirname, 'dist/brand/dist')
        )

        // Copy logos and visual assets
        copyDirRecursive(
          path.resolve(__dirname, 'brand/assets'),
          path.resolve(__dirname, 'dist/brand/assets')
        )

        console.log('✅ Brand distribution copied successfully')
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@brand": path.resolve(__dirname, "./brand"),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-select',
                '@radix-ui/react-tabs', '@radix-ui/react-label', '@radix-ui/react-slot',
                '@radix-ui/react-switch', '@radix-ui/react-checkbox', '@radix-ui/react-toast',
                '@radix-ui/react-dropdown-menu', '@radix-ui/react-avatar', '@radix-ui/react-tooltip',
                '@radix-ui/react-popover', '@radix-ui/react-separator', '@radix-ui/react-alert-dialog'],
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'lucide-react']
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },

    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    reportCompressedSize: true,
    cssMinify: true,
  },

  server: {
    port: 5173,
    host: true,
    open: false,
    cors: true,
    proxy: {
      '/v1': {
        target: 'http://localhost:8787',  // Worker dev server
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8787',  // Serve R2 media files from backend
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 4173,
    host: true,
    cors: true,
  },

  esbuild: {
    legalComments: 'none',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@cloudflare/workers-types']
  }
})
