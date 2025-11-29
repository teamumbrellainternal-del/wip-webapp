// src/components/ui/accordion.stories.tsx
import type { Story } from '@ladle/react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion'

export default {
  title: 'Components / Accordion',
}

export const Default: Story = () => (
  <div className="p-8 max-w-md">
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Leger?</AccordionTrigger>
        <AccordionContent>
          Leger is a secure secret management platform that helps you manage API keys,
          configuration, and deployments across your infrastructure.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I deploy a service?</AccordionTrigger>
        <AccordionContent>
          Navigate to the Releases page, create a new release with your Git repository URL,
          and Leger will automatically deploy your service to Cloudflare Workers.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is my data encrypted?</AccordionTrigger>
        <AccordionContent>
          Yes, all secrets are encrypted at rest and in transit. Only authenticated users
          within your Tailscale network can access your secrets.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
)

Default.meta = {
  description: 'Collapsible accordion component for FAQs and documentation',
}

export const Multiple: Story = () => (
  <div className="p-8 max-w-md">
    <Accordion type="multiple">
      <AccordionItem value="item-1">
        <AccordionTrigger>API Keys</AccordionTrigger>
        <AccordionContent>
          Manage your OpenAI, Anthropic, and custom API keys in one secure location.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Releases</AccordionTrigger>
        <AccordionContent>
          Deploy and manage your Cloudflare Worker services with automatic Git sync.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Settings</AccordionTrigger>
        <AccordionContent>
          Configure your Cloudflare credentials and account preferences.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
)

Multiple.meta = {
  description: 'Multiple items can be expanded simultaneously',
}
