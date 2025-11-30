/**
 * ToolboxButton Component
 * Displays an umbrella-themed button for accessing the artist toolbox
 * Styled to match social media icons in SocialLinksBar
 */

import { useState } from 'react'
import ToolboxModal from './ToolboxModal'

// Umbrella Icon - simplified version of the brand logo
export function UmbrellaIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.5 2 12h2c0-4.4 3.6-8 8-8s8 3.6 8 8h2c0-5.5-4.5-10-10-10z" />
      <path d="M12 12v8c0 1.1-.9 2-2 2s-2-.9-2-2v-1H6v1c0 2.2 1.8 4 4 4s4-1.8 4-4v-8h-2z" />
      <path d="M12 4c-3.3 0-6 2.7-6 6h12c0-3.3-2.7-6-6-6z" fillOpacity="0.6" />
    </svg>
  )
}

interface ToolboxButtonProps {
  className?: string
}

/**
 * ToolboxButton - Circular button with umbrella icon
 * Opens the ToolboxModal when clicked
 */
export function ToolboxButton({ className = '' }: ToolboxButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md transition-all hover:scale-105 hover:shadow-lg ${className}`}
        title="Artist Toolbox"
        aria-label="Open Artist Toolbox"
      >
        <UmbrellaIcon className="h-5 w-5" />
      </button>

      <ToolboxModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}

export default ToolboxButton
