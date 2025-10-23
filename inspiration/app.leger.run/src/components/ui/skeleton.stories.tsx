// src/components/ui/skeleton.stories.tsx
import type { Story } from '@ladle/react'
import { Skeleton } from './skeleton'

export default {
  title: 'Utility / Skeleton',
}

export const Basic: Story = () => (
  <div className="space-y-4 p-8">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
    <Skeleton className="h-4 w-[150px]" />
  </div>
)

Basic.meta = {
  description: 'Basic skeleton loader lines',
}

export const CardSkeleton: Story = () => (
  <div className="p-8 max-w-md">
    <div className="space-y-3 p-6 border rounded-lg">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
)

CardSkeleton.meta = {
  description: 'Loading skeleton for a service card',
}

export const TableSkeleton: Story = () => (
  <div className="p-8">
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
)

TableSkeleton.meta = {
  description: 'Loading skeleton for a data table',
}
