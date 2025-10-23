import type { Story } from "@ladle/react";
import { PageHeader } from "./PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Download, Settings, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Basic: Story = () => {
  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description="Welcome to your dashboard overview"
      />
    </div>
  );
};

export const WithAction: Story = () => {
  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="API Keys"
        description="Manage your API keys and access tokens"
        action={<Button><Plus className="mr-2 h-4 w-4" />New API Key</Button>}
      />
    </div>
  );
};

export const WithMultipleActions: Story = () => {
  return (
    <div className="p-8">
      <PageHeader
        title="Releases"
        description="Deploy and manage your application releases"
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Release
            </Button>
          </div>
        }
      />
    </div>
  );
};

export const NoDescription: Story = () => {
  return (
    <div className="p-8">
      <PageHeader
        title="Settings"
      />
    </div>
  );
};

export const LongTitle: Story = () => {
  return (
    <div className="p-8">
      <PageHeader
        title="Advanced Configuration and Deployment Settings"
        description="Manage complex deployment configurations, environment variables, and CI/CD pipeline settings for your application"
        action={<Button><Settings className="mr-2 h-4 w-4" />Configure</Button>}
      />
    </div>
  );
};

export const WithBadge: Story = () => {
  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Marketplace</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        }
        description="Browse and install extensions for your application"
      />
    </div>
  );
};

export const DifferentActionStyles: Story = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Primary Action</h3>
        <PageHeader
          title="Projects"
          description="Manage your projects"
          action={<Button>Create Project</Button>}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Outline Action</h3>
        <PageHeader
          title="Documentation"
          description="Browse the documentation"
          action={<Button variant="outline">Search Docs</Button>}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">Destructive Action</h3>
        <PageHeader
          title="Delete Account"
          description="Permanently delete your account and all data"
          action={
            <Button variant="destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          }
        />
      </div>
    </div>
  );
};

export const ListPage: Story = () => {
  return (
    <div className="p-8">
      <PageHeader
        title="Team Members"
        description="Manage your team members and their permissions"
        action={<Button><Plus className="mr-2 h-4 w-4" />Invite Member</Button>}
      />
      <div className="mt-8 space-y-3">
        {[
          { name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
          { name: "Bob Smith", email: "bob@example.com", role: "Editor" },
          { name: "Charlie Brown", email: "charlie@example.com", role: "Viewer" },
        ].map((member, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            <Badge variant="outline">{member.role}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FormPage: Story = () => {
  return (
    <div className="p-8">
      <PageHeader
        title="Create New Release"
        description="Configure and deploy a new application release"
      />
      <div className="mt-8 max-w-2xl space-y-6 border rounded-lg p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Release Name</label>
          <input
            type="text"
            placeholder="v1.0.0"
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
        <div className="flex gap-2">
          <Button>Create Release</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export const EmptyStatePage: Story = () => {
  return (
    <div className="p-8">
      <PageHeader
        title="Integrations"
        description="Connect your favorite tools and services"
        action={<Button><Plus className="mr-2 h-4 w-4" />Add Integration</Button>}
      />
      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-4xl">🔌</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Get started by connecting your first integration. Choose from our wide selection of
          supported services.
        </p>
        <Button>Browse Integrations</Button>
      </div>
    </div>
  );
};

export const ResponsiveLayout: Story = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">
          Desktop (action on the right)
        </h3>
        <div className="border rounded-lg p-4">
          <PageHeader
            title="Reports"
            description="Generate and download reports"
            action={
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            }
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4 text-muted-foreground">
          Mobile (stacked layout)
        </h3>
        <div className="border rounded-lg p-4 max-w-sm">
          <PageHeader
            title="Reports"
            description="Generate and download reports"
            action={
              <Button className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
};
