/**
 * Settings Page
 * User account information (read-only for v0.1.0)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CategorySection } from '@/components/ui/form/layouts/category-section';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAuth } from '@/hooks/use-auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SettingsPage() {
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <PageLayout>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Settings"
        description="View your account information and preferences"
      />

      <CategorySection
        title="Account Information"
        description="Your Leger account details. These are managed through your Tailscale authentication."
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user?.email || ''}
            readOnly
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tailnet">Tailnet</Label>
          <Input
            id="tailnet"
            value={user?.tailnet || ''}
            readOnly
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={user?.display_name || 'Not set'}
            readOnly
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user_uuid">User UUID</Label>
          <div className="flex items-center gap-2">
            <Input
              id="user_uuid"
              value={user?.user_uuid || ''}
              readOnly
              className="bg-muted font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(user?.user_uuid || '', 'user_uuid')}
              title="Copy UUID"
            >
              {copiedField === 'user_uuid' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="created_at">Member Since</Label>
          <Input
            id="created_at"
            value={
              user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : ''
            }
            readOnly
            className="bg-muted"
          />
        </div>
      </CategorySection>
    </PageLayout>
  );
}
