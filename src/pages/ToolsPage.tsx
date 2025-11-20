import { useNavigate } from 'react-router-dom'
import { MessageCircle, FolderOpen, Palette } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MetaTags } from '@/components/MetaTags'

/**
 * Artist Toolbox Page (Screen 15)
 *
 * Purpose: Quick access hub for key artist tools
 * Access: Header navigation item "Tools" (D-044)
 *
 * Features:
 * - Message Fans: SMS/Email blast to segmented fan lists
 * - My Files: Cloud storage and file management
 * - Creative Studio: Video/text journal with block-based editor
 */
export default function ToolsPage() {
  const navigate = useNavigate()

  const tools = [
    {
      title: 'Message Fans',
      description: 'Send updates to your audience',
      icon: MessageCircle,
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-50 hover:bg-pink-100',
      borderColor: 'border-pink-200',
      route: '/tools/message-fans',
    },
    {
      title: 'My Files',
      description: 'Store and manage content',
      icon: FolderOpen,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-blue-200',
      route: '/tools/files',
    },
    {
      title: 'Creative Studio',
      description: 'Your digital art space',
      icon: Palette,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      borderColor: 'border-orange-200',
      route: '/tools/studio',
    },
  ]

  return (
    <AppLayout>
      <MetaTags
        title="Artist Toolbox"
        description="Access your essential artist tools for fan communication, file management, and creative work"
        url="/tools"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Artist Toolbox
          </h1>
          <p className="text-gray-600">
            Quick access to your essential tools
          </p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.route}
                className={`cursor-pointer transition-all duration-200 ${tool.borderColor} ${tool.bgColor} hover:shadow-lg`}
                onClick={() => navigate(tool.route)}
              >
                <CardHeader className="space-y-4">
                  <div className={`w-14 h-14 rounded-xl ${tool.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-7 w-7 ${tool.iconColor}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-gray-600">
                      {tool.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    Open Tool
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Optional: Quick Stats or Tips Section */}
        <div className="mt-12 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-purple-900">
                Pro Tip
              </h3>
              <p className="mt-1 text-sm text-purple-700">
                Use Message Fans to keep your audience engaged with regular updates,
                My Files to organize your content, and Creative Studio to brainstorm
                and plan your next creative project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
