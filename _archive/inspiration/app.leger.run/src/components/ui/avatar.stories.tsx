// src/components/ui/avatar.stories.tsx
import type { Story } from '@ladle/react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

export default {
  title: 'Components / Avatar',
}

export const WithFallback: Story = () => (
  <div className="space-y-4 p-8">
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>CD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>EF</AvatarFallback>
      </Avatar>
    </div>
  </div>
)

WithFallback.meta = {
  description: 'Avatars with initials fallback (Catppuccin colors)',
}

export const Sizes: Story = () => (
  <div className="space-y-4 p-8">
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-16 w-16">
        <AvatarFallback className="text-lg">LG</AvatarFallback>
      </Avatar>
      <Avatar className="h-20 w-20">
        <AvatarFallback className="text-xl">XL</AvatarFallback>
      </Avatar>
    </div>
  </div>
)

Sizes.meta = {
  description: 'Avatar size variants',
}

export const WithImage: Story = () => (
  <div className="space-y-4 p-8">
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>SC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="invalid-url" alt="@user" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  </div>
)

WithImage.meta = {
  description: 'Avatar with image (fallback shows if image fails to load)',
}
