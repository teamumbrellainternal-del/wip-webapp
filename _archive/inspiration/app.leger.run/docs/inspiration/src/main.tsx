import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initErrorTracking } from './utils/error-tracking'
import './index.css'

// Initialize error tracking
try {
  initErrorTracking()
} catch (error) {
  console.error('Failed to initialize error tracking:', error)
}

// Load Geist fonts
const loadGeistFonts = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://vercel.com/_next/static/media/geist-sans.ttf'
  document.head.appendChild(link)
  
  const linkMono = document.createElement('link')
  linkMono.rel = 'stylesheet'
  linkMono.href = 'https://vercel.com/_next/static/media/geist-mono.ttf'
  document.head.appendChild(linkMono)
}

// Alternative: Use @fontsource packages (recommended)
// npm install @fontsource/geist-sans @fontsource/geist-mono
// Then import in CSS:
// @import '@fontsource/geist-sans/400.css';
// @import '@fontsource/geist-sans/500.css';
// @import '@fontsource/geist-sans/600.css';
// @import '@fontsource/geist-mono/400.css';
// @import '@fontsource/geist-mono/500.css';

loadGeistFonts()

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found')
  document.body.innerHTML = '<div style="padding: 20px; font-family: monospace;">Failed to mount app: root element not found</div>'
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
