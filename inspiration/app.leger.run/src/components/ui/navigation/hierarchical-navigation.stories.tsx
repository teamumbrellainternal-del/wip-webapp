import type { StoryDefault } from '@ladle/react'
import { useState } from 'react'
import { HierarchicalNavigation } from './hierarchical-navigation'

export default {
  title: 'Navigation / Hierarchical Navigation',
} satisfies StoryDefault

const simpleItems = [
  { id: '1', label: 'Dashboard' },
  { id: '2', label: 'Settings' },
  { id: '3', label: 'Profile' },
]

const nestedItems = [
  {
    id: '1',
    label: 'Getting Started',
    children: [
      { id: '1.1', label: 'Installation' },
      { id: '1.2', label: 'Quick Start' },
      { id: '1.3', label: 'Configuration' },
    ],
  },
  {
    id: '2',
    label: 'Components',
    children: [
      { id: '2.1', label: 'Buttons' },
      { id: '2.2', label: 'Forms' },
      { id: '2.3', label: 'Tables' },
    ],
  },
  { id: '3', label: 'API Reference' },
]

const deeplyNestedItems = [
  {
    id: '1',
    label: 'Documentation',
    children: [
      {
        id: '1.1',
        label: 'Getting Started',
        children: [
          { id: '1.1.1', label: 'Installation' },
          { id: '1.1.2', label: 'Configuration' },
          {
            id: '1.1.3',
            label: 'First Steps',
            children: [
              { id: '1.1.3.1', label: 'Create Project' },
              { id: '1.1.3.2', label: 'Run Dev Server' },
            ],
          },
        ],
      },
      {
        id: '1.2',
        label: 'Advanced',
        children: [
          { id: '1.2.1', label: 'Deployment' },
          { id: '1.2.2', label: 'Performance' },
        ],
      },
    ],
  },
  {
    id: '2',
    label: 'API',
    children: [
      { id: '2.1', label: 'Authentication' },
      { id: '2.2', label: 'Endpoints' },
    ],
  },
]

const itemsWithStatus = [
  {
    id: '1',
    label: 'Setup',
    status: 'complete' as const,
    children: [
      { id: '1.1', label: 'Create Account', status: 'complete' as const },
      { id: '1.2', label: 'Verify Email', status: 'complete' as const },
    ],
  },
  {
    id: '2',
    label: 'Configuration',
    status: 'incomplete' as const,
    children: [
      { id: '2.1', label: 'API Keys', status: 'error' as const },
      { id: '2.2', label: 'Webhooks', status: 'incomplete' as const },
      { id: '2.3', label: 'Environments', status: 'complete' as const },
    ],
  },
  {
    id: '3',
    label: 'Deployment',
    status: 'incomplete' as const,
    children: [
      { id: '3.1', label: 'Build Settings', status: 'incomplete' as const },
      { id: '3.2', label: 'Deploy', status: 'incomplete' as const },
    ],
  },
]

export const Basic = () => {
  const [activeId, setActiveId] = useState('1')

  return (
    <div className="max-w-md p-8">
      <HierarchicalNavigation
        items={simpleItems}
        activeItemId={activeId}
        onItemClick={setActiveId}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium">Active Item: {activeId}</p>
      </div>
    </div>
  )
}

export const WithNestedItems = () => {
  const [activeId, setActiveId] = useState('1.2')

  return (
    <div className="max-w-md p-8">
      <HierarchicalNavigation
        items={nestedItems}
        activeItemId={activeId}
        onItemClick={setActiveId}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium">Active Item: {activeId}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Nested sections automatically expand to show the active item
        </p>
      </div>
    </div>
  )
}

export const DeeplyNested = () => {
  const [activeId, setActiveId] = useState('1.1.3.1')

  return (
    <div className="max-w-md p-8">
      <HierarchicalNavigation
        items={deeplyNestedItems}
        activeItemId={activeId}
        onItemClick={setActiveId}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium">Active Item: {activeId}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Multiple levels of nesting with automatic indentation
        </p>
      </div>
    </div>
  )
}

export const WithStatusIndicators = () => {
  const [activeId, setActiveId] = useState('2.1')

  return (
    <div className="max-w-md p-8">
      <HierarchicalNavigation
        items={itemsWithStatus}
        activeItemId={activeId}
        onItemClick={setActiveId}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-3">Active Item: {activeId}</p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500" />
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-500" />
            <span>Error</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-muted-foreground" />
            <span>Incomplete</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const SetupWizard = () => {
  const [activeId, setActiveId] = useState('1.1')

  const wizardSteps = [
    {
      id: '1',
      label: 'Account Setup',
      status: 'complete' as const,
      children: [
        { id: '1.1', label: 'Personal Information', status: 'complete' as const },
        { id: '1.2', label: 'Company Details', status: 'complete' as const },
        { id: '1.3', label: 'Team Members', status: 'complete' as const },
      ],
    },
    {
      id: '2',
      label: 'Integration',
      status: 'incomplete' as const,
      children: [
        { id: '2.1', label: 'Connect Repository', status: 'error' as const },
        { id: '2.2', label: 'Configure Build', status: 'incomplete' as const },
        { id: '2.3', label: 'Environment Variables', status: 'incomplete' as const },
      ],
    },
    {
      id: '3',
      label: 'Deployment',
      status: 'incomplete' as const,
      children: [
        { id: '3.1', label: 'Domain Setup', status: 'incomplete' as const },
        { id: '3.2', label: 'SSL Certificate', status: 'incomplete' as const },
        { id: '3.3', label: 'First Deploy', status: 'incomplete' as const },
      ],
    },
  ]

  return (
    <div className="max-w-md p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Setup Wizard</h2>
        <p className="text-sm text-muted-foreground">
          Complete all steps to finish setup
        </p>
      </div>

      <HierarchicalNavigation
        items={wizardSteps}
        activeItemId={activeId}
        onItemClick={setActiveId}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium">Current Step: {activeId}</p>
      </div>
    </div>
  )
}

export const DocumentationNav = () => {
  const [activeId, setActiveId] = useState('2.2.1')

  const docsStructure = [
    {
      id: '1',
      label: 'Introduction',
      children: [
        { id: '1.1', label: 'What is Leger?' },
        { id: '1.2', label: 'Why Leger?' },
        { id: '1.3', label: 'Core Concepts' },
      ],
    },
    {
      id: '2',
      label: 'Guides',
      children: [
        {
          id: '2.1',
          label: 'Installation',
          children: [
            { id: '2.1.1', label: 'CLI Installation' },
            { id: '2.1.2', label: 'Web UI Access' },
          ],
        },
        {
          id: '2.2',
          label: 'Managing Secrets',
          children: [
            { id: '2.2.1', label: 'Creating Secrets' },
            { id: '2.2.2', label: 'Updating Secrets' },
            { id: '2.2.3', label: 'Deleting Secrets' },
          ],
        },
      ],
    },
    {
      id: '3',
      label: 'API Reference',
      children: [
        { id: '3.1', label: 'Authentication' },
        { id: '3.2', label: 'Secrets API' },
        { id: '3.3', label: 'Releases API' },
      ],
    },
  ]

  return (
    <div className="max-w-md p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Documentation</h2>
        <p className="text-sm text-muted-foreground">
          Browse the documentation
        </p>
      </div>

      <HierarchicalNavigation
        items={docsStructure}
        activeItemId={activeId}
        onItemClick={(id) => {
          setActiveId(id)
          console.log('Navigated to:', id)
        }}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium">Viewing: {activeId}</p>
      </div>
    </div>
  )
}

export const CollapsibleSections = () => {
  const [activeId, setActiveId] = useState('1')

  return (
    <div className="max-w-md p-8">
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Tip:</strong> Click the chevron icon to expand/collapse sections independently
        </p>
      </div>

      <HierarchicalNavigation
        items={deeplyNestedItems}
        activeItemId={activeId}
        onItemClick={setActiveId}
      />
    </div>
  )
}

export const FileExplorer = () => {
  const [activeId, setActiveId] = useState('1.1.2')

  const fileStructure = [
    {
      id: '1',
      label: 'src',
      children: [
        {
          id: '1.1',
          label: 'components',
          children: [
            { id: '1.1.1', label: 'Button.tsx' },
            { id: '1.1.2', label: 'Card.tsx' },
            { id: '1.1.3', label: 'Input.tsx' },
          ],
        },
        {
          id: '1.2',
          label: 'pages',
          children: [
            { id: '1.2.1', label: 'Home.tsx' },
            { id: '1.2.2', label: 'About.tsx' },
          ],
        },
        { id: '1.3', label: 'App.tsx' },
        { id: '1.4', label: 'index.tsx' },
      ],
    },
    {
      id: '2',
      label: 'public',
      children: [
        { id: '2.1', label: 'favicon.ico' },
        { id: '2.2', label: 'index.html' },
      ],
    },
    { id: '3', label: 'package.json' },
    { id: '4', label: 'tsconfig.json' },
  ]

  return (
    <div className="max-w-md p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Project Files</h2>
        <p className="text-sm text-muted-foreground">
          Navigate your project structure
        </p>
      </div>

      <HierarchicalNavigation
        items={fileStructure}
        activeItemId={activeId}
        onItemClick={setActiveId}
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium">Selected: {activeId}</p>
      </div>
    </div>
  )
}

export const FullWidthNavigation = () => {
  const [activeId, setActiveId] = useState('2.1')

  return (
    <div className="p-8">
      <div className="grid grid-cols-[300px_1fr] gap-8">
        <aside className="border-r pr-8">
          <HierarchicalNavigation
            items={itemsWithStatus}
            activeItemId={activeId}
            onItemClick={setActiveId}
          />
        </aside>

        <main>
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Content for {activeId}</h2>
            <p className="text-muted-foreground">
              This demonstrates how the navigation might be used in a sidebar layout.
              The navigation persists on the left while content changes on the right.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export const CustomClassName = () => {
  const [activeId, setActiveId] = useState('1')

  return (
    <div className="max-w-md p-8">
      <HierarchicalNavigation
        items={simpleItems}
        activeItemId={activeId}
        onItemClick={setActiveId}
        className="bg-muted/50 p-4 rounded-lg border"
      />

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium">Custom Styling Applied</p>
        <p className="text-xs text-muted-foreground mt-2">
          The navigation has custom background, padding, and border via className prop
        </p>
      </div>
    </div>
  )
}
