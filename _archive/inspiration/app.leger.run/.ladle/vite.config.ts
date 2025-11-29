import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'

// Helper to recursively copy directories
function copyDirRecursive(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }

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
  plugins: [
    react(),
    {
      name: 'copy-brand-assets',
      closeBundle() {
        console.log('📦 Copying brand assets to Ladle build...')

        // Copy brand fonts
        const fontsSrc = path.resolve(__dirname, '../brand/dist/fonts')
        const fontsDest = path.resolve(__dirname, '../dist-storybook/brand/dist/fonts')

        if (existsSync(fontsSrc)) {
          copyDirRecursive(fontsSrc, fontsDest)
          console.log('✅ Brand fonts copied to dist-storybook/brand/dist/fonts/')
        } else {
          console.warn('⚠️  Brand fonts not found at', fontsSrc)
        }

        // Copy brand CSS files (tokens.css)
        const tokensSrc = path.resolve(__dirname, '../brand/dist/tokens.css')
        const tokensDest = path.resolve(__dirname, '../dist-storybook/brand/dist/tokens.css')

        const tokensDir = path.dirname(tokensDest)
        if (!existsSync(tokensDir)) {
          mkdirSync(tokensDir, { recursive: true })
        }

        if (existsSync(tokensSrc)) {
          copyFileSync(tokensSrc, tokensDest)
          console.log('✅ tokens.css copied')
        }

        // Create .nojekyll file for GitHub Pages
        const nojekyllPath = path.resolve(__dirname, '../dist-storybook/.nojekyll')
        copyFileSync(path.resolve(__dirname, '.nojekyll'), nojekyllPath)
        console.log('✅ .nojekyll file created for GitHub Pages')
      }
    }
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@brand': path.resolve(__dirname, '../brand'),
    },
  },

  build: {
    outDir: '../dist-storybook',
    emptyOutDir: true,
  },

  server: {
    port: 61000,
  },

  css: {
    postcss: path.resolve(__dirname, '../postcss.config.js'),
  },
})
