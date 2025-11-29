import type { Story } from "@ladle/react";
import { PageLayout } from "./PageLayout";
import { PageHeader } from "./PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Basic: Story = () => {
  return (
    <PageLayout>
      <div className="bg-muted p-8 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Page Layout Container</h2>
        <p className="text-muted-foreground">
          This content is wrapped in PageLayout, which provides:
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>• Max width of 6xl (1152px)</li>
          <li>• Centered horizontally</li>
          <li>• Vertical spacing (space-y-8)</li>
          <li>• Padding (p-6)</li>
        </ul>
      </div>
    </PageLayout>
  );
};

export const WithPageHeader: Story = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />
      <div className="bg-muted p-6 rounded-md">
        <p className="text-sm">Page content goes here...</p>
      </div>
    </PageLayout>
  );
};

export const WithMultipleSections: Story = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Dashboard"
        description="Overview of your account activity"
        action={
          <Button>Download Report</Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Active users this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,234</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Total revenue this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12,345</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth</CardTitle>
            <CardDescription>Compared to last month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+23%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions in your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">Activity {i + 1}</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export const ListPage: Story = () => {
  return (
    <PageLayout>
      <PageHeader
        title="API Keys"
        description="Manage your API keys and access tokens"
        action={
          <Button>Create New Key</Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Active Keys</CardTitle>
          <CardDescription>Currently active API keys</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">API Key {i + 1}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    sk_test_•••••••••••{Math.random().toString(36).substr(2, 4)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created on Jan {i + 1}, 2025
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export const FormPage: Story = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Create Release"
        description="Configure a new release deployment"
      />

      <Card>
        <CardHeader>
          <CardTitle>Release Configuration</CardTitle>
          <CardDescription>Enter the details for your new release</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Release Name</label>
            <input
              type="text"
              placeholder="v1.0.0"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Git URL</label>
            <input
              type="text"
              placeholder="https://github.com/user/repo.git"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Git Branch</label>
            <input
              type="text"
              placeholder="main"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="Describe this release..."
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button>Create Release</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export const EmptyState: Story = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Projects"
        description="Manage your projects and deployments"
        action={
          <Button>New Project</Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            Get started by creating your first project. You'll be able to manage deployments,
            configure settings, and track your releases.
          </p>
          <Button>Create Your First Project</Button>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export const TwoColumnLayout: Story = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Account Settings"
        description="Manage your account information and preferences"
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                {['Profile', 'Security', 'Notifications', 'Billing', 'Team'].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm"
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Marketing Emails</p>
                  <p className="text-xs text-muted-foreground">Receive promotional content</p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};
