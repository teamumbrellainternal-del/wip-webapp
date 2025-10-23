import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Removed unused cloudflare import
import path from 'path'

export default defineConfig({
  plugins: [
    react()
  ],
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
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'rjsf': ['@rjsf/core', '@rjsf/validator-ajv8'],
          'ui': ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-select', 
                '@radix-ui/react-tabs', '@radix-ui/react-label', '@radix-ui/react-slot', 
                '@radix-ui/react-switch', '@radix-ui/react-checkbox', '@radix-ui/react-toast'],
          'form': ['react-hook-form', '@hookform/resolvers', 'zod'],
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
    port: 3000,
    host: true,
    open: false,
    cors: true
  },
  
  preview: {
    port: 3001,
    host: true,
    cors: true
  },
  
  esbuild: {
    legalComments: 'none',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', '@rjsf/core', '@rjsf/validator-ajv8'],
    exclude: ['@cloudflare/workers-types']
  }
})
