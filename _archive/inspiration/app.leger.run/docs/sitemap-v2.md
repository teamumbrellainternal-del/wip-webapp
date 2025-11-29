# Leger Frontend: Sitemap & Information Architecture

**Document Version:** 2.0  
**Date:** October 2025  
**Purpose:** Comprehensive site structure, navigation patterns, and page composition specifications for Leger web application.

**Scope:** Complete information architecture for v0.2.0+ Web UI serving as the configuration management interface for Leger deployments.

---

## Table of Contents

1. [Core Navigation Principles](#core-navigation-principles)
2. [Global Navigation Structure](#global-navigation-structure)
3. [URL Structure & Routing](#url-structure--routing)
4. [Page Composition Specifications](#page-composition-specifications)
5. [Screenshot Reference Map](#screenshot-reference-map)
6. [Navigation Behaviors](#navigation-behaviors)
7. [Component Assembly Patterns](#component-assembly-patterns)
8. [State Management Requirements](#state-management-requirements)
9. [Interaction Flow Patterns](#interaction-flow-patterns)

---

## Core Navigation Principles

### No Dashboard Philosophy
- **Default landing page:** `/api-keys` (not a dashboard)
- Users land directly on the most frequently accessed page
- No summary/overview page required
- Direct access to functional pages from navigation

### Two-Tier Header Navigation
Leger adopts a two-row header structure similar to Vercel:

**Row 1: Global Context**
- Left side: Logo, My Account dropdown
- Right side: GitHub Star button, Changelog link, Docs link, User Avatar menu

**Row 2: Primary Navigation**
- Horizontal menu: API Keys, Releases, Models (coming soon), Marketplace, Settings
- No dropdown nesting in Row 2
- Active page indicated by underline or background highlight

### Terminology Consistency
- **"Releases"** and **"Deployments"** are fully interchangeable
- A "release" is a timestamped complete configuration
- "Deployment" refers to applying a release to infrastructure
- UI uses "Releases" as primary term for clarity

---

## Global Navigation Structure

```
┌───────────────────────────────────────────────────────────────────┐
│ Row 1: Global                                                     │
│ [🏠 Leger] [My Account ▼] ........... [⭐ Star] [📋 Changelog]   │
│                                        [📚 Docs] [THEME TOGGLE]   │
├───────────────────────────────────────────────────────────────────┤
│ Row 2: Primary Navigation                                         │
│ [API Keys] [Releases] [Models] [Marketplace] [Settings]          │
└───────────────────────────────────────────────────────────────────┘
```

### Primary Navigation Items (Row 2)

| Item | URL | Description | Screenshot Reference |
|------|-----|-------------|---------------------|
| **API Keys** | `/api-keys` | Third-party API secrets management | env4, env6, env7, integrations-marketplace2 |
| **Releases** | `/releases` | Configuration releases/deployments | main-config-management1, project-settings2, domain6 |
| **Models** | `/models` | (Coming soon) LLM model management | - |
| **Marketplace** | `/marketplace` | Integrations marketplace | integrations-marketplace1, integrations-marketplace2 |
| **Settings** | `/settings` | Account settings, Tailscale, Cockpit | accountsettings2, security1, security2 |

---

## URL Structure & Routing

### Complete Route Map

```
/                              → Redirect to /api-keys

/api-keys                      → API Keys & Integrations page (DEFAULT)
  ?provider=[openai|anthropic|custom]  → Filter view

/releases                      → List of all configuration releases
  ?status=[draft|deployed|archived]    → Filter by status
  ?sort=[created|updated|name]         → Sort order

/releases/new                  → Create new release (full RJSF form)

/releases/:id                  → Edit existing release (full RJSF form)
  #[section-anchor]            → Deep link to form section

/releases/:id/settings         → Release meta settings
  #release-name                → Section anchors
  #release-id
  #domain-config
  #deployment-status
  #archive-release
  #delete-release

/releases/:id/deploy           → Deployment status page
  ?step=[rendering|uploading|complete]  → Track progress

/models                        → Coming soon placeholder page

/marketplace                   → Integrations marketplace catalog
  ?category=[ai|storage|monitoring]    → Filter by category
  ?sort=[popular|recent|name]          → Sort order

/marketplace/:id               → Integration detail page
  ?action=install              → Open install overlay

/settings                      → Account settings page
  #avatar                      → Section anchors (scroll navigation)
  #display-name
  #username
  #tailscale-network
  #cockpit-enablement
  #account-id
  #logout
  #delete-account

/login                         → Tailscale authentication flow
/logout                        → Sign out and clear session
/auth/callback                 → OAuth callback handler
```

### URL State Management

**Query Parameters Used**:
- `?provider=` - Filter views in API Keys
- `?status=` - Filter releases by status
- `?category=` - Filter marketplace integrations
- `?sort=` - Change sorting order
- `?action=install` - Trigger overlay/modal
- `?step=` - Track multi-step processes

**Hash Fragments Used**:
- `#section-name` - Scroll navigation within long pages
- Settings page uses hash for section navigation
- Release edit page uses hash for form section deep linking

---

## Page Composition Specifications

### Page: API Keys (`/api-keys`)

**Screenshot References:** env4, env6, env7, integrations-marketplace2

**Layout Type:** Full-width single column with CategorySections

**Purpose:** Manage third-party API keys and integration credentials for AI services

**Component Structure:**
```typescript
<PageLayout>
  <PageHeader
    title="API Keys & Integrations"
    description="Manage third-party API keys for AI services used in your deployments"
  />
  
  {/* Major Providers - Category Sections */}
  <CategorySection
    title="OpenAI"
    description="Configure OpenAI API access for GPT models"
    isDirty={openaiDirty}
    onSave={saveOpenAI}
    documentationLink={{
      text: "OpenAI API Documentation",
      href: "https://platform.openai.com/docs"
    }}
  >
    <FieldGroup>
      <SecretField
        label="API Key"
        description="Your OpenAI API key (sk-...)"
        value={openaiKey}
        onChange={setOpenaiKey}
        error={errors.openaiKey}
      />
      <TextField
        label="Organization ID"
        description="Optional: Your OpenAI organization ID"
        value={openaiOrgId}
        onChange={setOpenaiOrgId}
        optional
      />
    </FieldGroup>
  </CategorySection>
  
  <CategorySection
    title="Anthropic"
    description="Configure Anthropic API access for Claude models"
    isDirty={anthropicDirty}
    onSave={saveAnthropic}
    documentationLink={{
      text: "Anthropic API Documentation",
      href: "https://docs.anthropic.com"
    }}
  >
    <FieldGroup>
      <SecretField
        label="API Key"
        description="Your Anthropic API key (sk-ant-...)"
        value={anthropicKey}
        onChange={setAnthropicKey}
        error={errors.anthropicKey}
      />
    </FieldGroup>
  </CategorySection>
  
  {/* Additional major providers follow same pattern */}
  <CategorySection title="Google AI" {...}>
    {/* Similar structure */}
  </CategorySection>
  
  {/* Custom Providers Section - Table View */}
  <CategorySection
    title="Custom API Endpoints"
    description="Add custom API providers not listed above"
  >
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Configure custom OpenAI-compatible API endpoints
        </p>
        <Button onClick={openAddCustomModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Endpoint
        </Button>
      </div>
      
      {customEndpoints.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Base URL</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead>Used In</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customEndpoints.map(endpoint => (
              <TableRow key={endpoint.id}>
                <TableCell>{endpoint.name}</TableCell>
                <TableCell>
                  <code className="text-xs">{endpoint.baseUrl}</code>
                </TableCell>
                <TableCell>
                  <SecretField value="•••" inline />
                </TableCell>
                <TableCell>
                  <Badge>{endpoint.releaseCount} releases</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => editEndpoint(endpoint)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteEndpoint(endpoint)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No custom endpoints configured</p>
          <p className="text-sm mt-2">Add your first custom API endpoint to get started</p>
        </div>
      )}
    </div>
  </CategorySection>
  
  {/* Read-only Status Section */}
  <CategorySection
    title="Connected Services"
    description="View which releases are using which API keys"
  >
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Active API integrations across your releases:
      </p>
      <div className="grid gap-2">
        <div className="flex justify-between items-center p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">OpenAI</Badge>
            <span className="text-sm">Used in 3 releases</span>
          </div>
          <Button variant="link" asChild>
            <Link to="/releases?provider=openai">View Releases</Link>
          </Button>
        </div>
        {/* More status cards */}
      </div>
      
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm">
          Looking for more integrations? 
          <Button variant="link" asChild className="ml-1 p-0 h-auto">
            <Link to="/marketplace">Browse the Marketplace</Link>
          </Button>
        </p>
      </div>
    </div>
  </CategorySection>
</PageLayout>
```

**Key Patterns:**
- Each major provider (OpenAI, Anthropic, etc.) gets a CategorySection
- Each section has independent save button
- Secrets are masked by default with show/hide toggle
- Custom providers displayed in table format (like environment variables in env7)
- Connected services shown as read-only status at bottom
- Links to marketplace for additional integrations

**Modal: Add Custom Endpoint** (triggered by button):
```typescript
<Dialog open={showAddCustom} onOpenChange={setShowAddCustom}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Custom API Endpoint</DialogTitle>
      <DialogDescription>
        Configure an OpenAI-compatible API endpoint
      </DialogDescription>
    </DialogHeader>
    
    <FieldGroup>
      <TextField
        label="Display Name"
        description="How you'll identify this endpoint"
        value={customForm.name}
        onChange={v => setCustomForm({...customForm, name: v})}
      />
      <URLInput
        label="Base URL"
        description="Full API base URL including protocol"
        placeholder="https://api.example.com/v1"
        value={customForm.baseUrl}
        onChange={v => setCustomForm({...customForm, baseUrl: v})}
      />
      <SecretField
        label="API Key"
        description="Authentication key for this endpoint"
        value={customForm.apiKey}
        onChange={v => setCustomForm({...customForm, apiKey: v})}
      />
      <ToggleField
        label="Verify SSL Certificate"
        description="Disable only for testing with self-signed certificates"
        checked={customForm.verifySsl}
        onCheckedChange={v => setCustomForm({...customForm, verifySsl: v})}
      />
    </FieldGroup>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowAddCustom(false)}>
        Cancel
      </Button>
      <Button onClick={saveCustomEndpoint}>
        Add Endpoint
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Page: Releases List (`/releases`)

**Screenshot References:** main-config-management1, domain6

**Layout Type:** Grid/list view with cards

**Purpose:** Display all configuration releases, create new releases, access existing ones

**Component Structure:**
```typescript
<PageLayout>
  <PageHeader
    title="Configuration Releases"
    description="Timestamped complete configurations for deployment"
    action={
      <Button onClick={() => navigate('/releases/new')}>
        <Plus className="h-4 w-4 mr-2" />
        Create New Release
      </Button>
    }
  />
  
  {/* Filters and Search */}
  <div className="flex gap-4 mb-6">
    <div className="flex-1">
      <Input
        placeholder="Search releases..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />
    </div>
    <SelectField
      label="Status"
      options={[
        { value: 'all', label: 'All Statuses' },
        { value: 'draft', label: 'Draft' },
        { value: 'deployed', label: 'Deployed' },
        { value: 'archived', label: 'Archived' },
      ]}
      value={statusFilter}
      onChange={setStatusFilter}
      inline
    />
    <SelectField
      label="Sort"
      options={[
        { value: 'updated', label: 'Last Updated' },
        { value: 'created', label: 'Date Created' },
        { value: 'name', label: 'Name' },
      ]}
      value={sortOrder}
      onChange={setSortOrder}
      inline
    />
  </div>
  
  {/* Release Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {releases.map(release => (
      <Card key={release.id} className="hover:border-primary transition-colors">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{release.name}</CardTitle>
              <CardDescription>Version {release.version}</CardDescription>
            </div>
            <Badge variant={release.status === 'deployed' ? 'default' : 'secondary'}>
              {release.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Services:</span>
              <span className="font-medium">{release.serviceCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Secrets Used:</span>
              <span className="font-medium">{release.secretCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="font-medium">{formatDate(release.updatedAt)}</span>
            </div>
            
            {release.deploymentStatus && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  {release.deploymentStatus === 'rendering' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Rendering templates...</span>
                    </>
                  )}
                  {release.deploymentStatus === 'ready' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Ready to deploy</span>
                    </>
                  )}
                  {release.deploymentStatus === 'deployed' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Deployed</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/releases/${release.id}`)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/releases/${release.id}`)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/releases/${release.id}/settings`)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/releases/${release.id}/deploy`)}>
                Deployment Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => duplicateRelease(release.id)}>
                Duplicate
              </DropdownMenuItem>
              {release.status === 'deployed' && (
                <DropdownMenuItem onClick={() => archiveRelease(release.id)}>
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => deleteRelease(release.id)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    ))}
  </div>
  
  {/* Empty State */}
  {releases.length === 0 && (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold mb-2">No releases yet</h3>
      <p className="text-muted-foreground mb-4">
        Create your first configuration release to get started
      </p>
      <Button onClick={() => navigate('/releases/new')}>
        Create First Release
      </Button>
    </div>
  )}
</PageLayout>
```

**Key Patterns:**
- Grid layout for release cards
- Each card shows key metadata
- Status badges (deployed, draft, archived)
- Deployment status indicator when applicable
- Actions dropdown per card (three-dot menu)
- Filters and search at top
- Empty state for first-time users

---

### Page: Release Edit (`/releases/:id` or `/releases/new`)

**Screenshot References:** main-config-management1, project-settings2

**Layout Type:** Sidebar navigation + main content (single scrollable page)

**Purpose:** Configure all aspects of a release using RJSF declarative form with 29 decision variables

**Component Structure:**
```typescript
<PageLayout>
  <div className="flex min-h-screen">
    {/* Left Sidebar Navigation */}
    <aside className="w-64 border-r bg-muted/50 sticky top-0 h-screen overflow-y-auto">
      <div className="p-4">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/releases')}
            className="w-full justify-start"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Releases
          </Button>
        </div>
        
        <div className="mb-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
            Configuration
          </h2>
          <p className="text-xs text-muted-foreground">
            {release.name || 'New Release'}
          </p>
        </div>
        
        <HierarchicalNavigation
          sections={[
            {
              id: 'general',
              label: 'General',
              isExpanded: true,
              subsections: [
                { id: 'project-info', label: 'Project Info', anchor: '#general-project-info' },
                { id: 'framework', label: 'Framework', anchor: '#general-framework' },
              ]
            },
            {
              id: 'ai-stack',
              label: 'AI Stack',
              isExpanded: true,
              subsections: [
                { id: 'llm-config', label: 'LLM Configuration', anchor: '#ai-stack-llm-config' },
                { id: 'rag-config', label: 'RAG Configuration', anchor: '#ai-stack-rag-config' },
                { id: 'embeddings', label: 'Embeddings', anchor: '#ai-stack-embeddings' },
                { id: 'web-search', label: 'Web Search', anchor: '#ai-stack-web-search' },
              ]
            },
            {
              id: 'services',
              label: 'Services',
              isExpanded: false,
              subsections: [
                { id: 'core-services', label: 'Core Services', anchor: '#services-core-services' },
                { id: 'optional-services', label: 'Optional Services', anchor: '#services-optional-services' },
              ]
            },
            {
              id: 'networking',
              label: 'Networking',
              isExpanded: false,
              subsections: [
                { id: 'domains', label: 'Domains', anchor: '#networking-domains' },
                { id: 'ports', label: 'Ports', anchor: '#networking-ports' },
                { id: 'https', label: 'HTTPS/TLS', anchor: '#networking-https' },
              ]
            },
            {
              id: 'storage',
              label: 'Storage',
              isExpanded: false,
              subsections: [
                { id: 'volumes', label: 'Volumes', anchor: '#storage-volumes' },
                { id: 'databases', label: 'Databases', anchor: '#storage-databases' },
              ]
            },
            {
              id: 'security',
              label: 'Security',
              isExpanded: false,
              subsections: [
                { id: 'authentication', label: 'Authentication', anchor: '#security-authentication' },
                { id: 'secrets', label: 'Secrets', anchor: '#security-secrets' },
              ]
            },
            {
              id: 'advanced',
              label: 'Advanced',
              isExpanded: false,
              subsections: [
                { id: 'environment-vars', label: 'Environment Variables', anchor: '#advanced-environment-vars' },
                { id: 'build-config', label: 'Build Configuration', anchor: '#advanced-build-config' },
              ]
            }
          ]}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
        />
        
        {/* Completion Indicator */}
        <div className="mt-6 p-3 bg-background rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Completion</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {requiredFieldsRemaining} required fields remaining
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-4 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/releases/${release.id}/settings`)}
            className="w-full justify-start"
          >
            <Settings className="h-4 w-4 mr-2" />
            Release Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/releases/${release.id}/deploy`)}
            className="w-full justify-start"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Deployment Status
          </Button>
        </div>
      </div>
    </aside>
    
    {/* Main Content - RJSF Form */}
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {release.name || 'New Release Configuration'}
          </h1>
          <p className="text-muted-foreground">
            Configure your deployment using the 29 decision variables below.
            Changes are auto-saved as you work.
          </p>
        </div>
        
        {/* RJSF Form - Declarative rendering */}
        <Form
          schema={releaseConfigurationSchema}
          uiSchema={uiSchema}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          templates={{
            FieldTemplate: SimpleFieldTemplate,
            ObjectFieldTemplate: SimpleObjectFieldTemplate,
            ArrayFieldTemplate: SimpleArrayFieldTemplate,
          }}
          widgets={customWidgets}
          customValidate={customValidate}
          showErrorList={false}
          noHtml5Validate
        >
          {/* Form sections render as CategorySections automatically */}
          {/* Each section has its own save button via customization */}
          
          {/* Hidden submit button - not used in this flow */}
          <button type="submit" className="hidden" />
        </Form>
        
        {/* Marketplace Integration Overlay Trigger */}
        {showMarketplacePrompt && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Need additional integrations?
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Browse the marketplace for additional services and integrations you can add to this release.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openMarketplaceOverlay}
                  className="border-blue-300 dark:border-blue-700"
                >
                  Browse Marketplace
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMarketplacePrompt(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Validation Summary at Bottom */}
        <div className="mt-8 sticky bottom-4 z-10">
          <ValidationSummary
            errorCount={validationErrors.length}
            warningCount={validationWarnings.length}
            successCount={validFields.length}
            totalFields={totalFields}
          />
        </div>
      </div>
    </main>
  </div>
  
  {/* Marketplace Overlay (when triggered) */}
  {showMarketplaceOverlay && (
    <MarketplaceOverlay
      isOpen={showMarketplaceOverlay}
      onClose={() => setShowMarketplaceOverlay(false)}
      onInstall={handleInstallIntegration}
      currentRelease={release}
    />
  )}
</PageLayout>
```

**Key Patterns:**
- **Single scrollable page** with sidebar navigation (not multi-step wizard)
- Left sidebar provides **searchable/navigable index** of all configuration sections
- RJSF renders form declaratively from schema
- Each section (CategorySection) has independent save button
- Sidebar shows completion percentage
- Smooth scroll navigation between sections (hash anchors)
- **Marketplace integration prompt** appears contextually
- **Marketplace overlay** can be triggered without leaving configuration page
- Auto-save functionality for draft configurations
- Validation summary sticky at bottom
- No "Next/Previous" buttons - free-form navigation

**Sidebar Navigation Behavior:**
- Sections can collapse/expand (accordion style)
- Active section highlighted based on scroll position
- Click section to scroll smoothly to that part of form
- Completion tracking shows progress
- Quick access to Release Settings and Deployment Status

**Marketplace Overlay Integration:**
- Appears as modal overlay on top of configuration page
- User can browse and install integrations without losing place
- Installed integrations automatically add to release configuration
- Closes overlay to return to exact same scroll position

---

### Page: Release Settings (`/releases/:id/settings`)

**Screenshot References:** project-settings2, accountsettings2

**Layout Type:** Full-width single column with CategorySections

**Purpose:** Meta-configuration for a specific release (name, domain, lifecycle)

**Component Structure:**
```typescript
<PageLayout>
  <Breadcrumb>
    <BreadcrumbItem>
      <Link to="/releases">Releases</Link>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <Link to={`/releases/${release.id}`}>{release.name}</Link>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem current>Settings</BreadcrumbItem>
  </Breadcrumb>
  
  <PageHeader
    title="Release Settings"
    description={`Meta-configuration for ${release.name}`}
  />
  
  <CategorySection
    title="Release Name"
    description="Used to identify your release on the Dashboard, Leger CLI, and in the URL"
    isDirty={nameDirty}
    onSave={saveName}
  >
    <FieldGroup>
      <div className="flex items-start gap-4">
        <div className="text-muted-foreground pt-2 text-sm whitespace-nowrap">
          leger.run/_ms-projects-62fdf754/
        </div>
        <TextField
          label="Name"
          value={releaseForm.name}
          onChange={v => setReleaseForm({...releaseForm, name: v})}
          maxLength={64}
          showCharCount
          error={errors.name}
        />
      </div>
    </FieldGroup>
  </CategorySection>
  
  <CategorySection
    title="Release ID"
    description="Used when interacting with the Leger API"
  >
    <FieldGroup>
      <div className="flex items-center gap-2">
        <Input
          value={release.id}
          readOnly
          className="font-mono text-sm"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => copyToClipboard(release.id)}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </FieldGroup>
    <DocumentationLink href="https://docs.leger.run/api/releases">
      Learn more about Release ID
    </DocumentationLink>
  </CategorySection>
  
  <CategorySection
    title="Domain Configuration"
    description="Caddy reverse proxy configuration for this release"
    isDirty={domainDirty}
    onSave={saveDomain}
    documentationLink={{
      text: "Domain Configuration",
      href: "https://docs.leger.run/domains"
    }}
  >
    <FieldGroup>
      <URLInput
        label="Base Domain"
        description="Primary domain for this release"
        prefix="https://"
        value={releaseForm.baseDomain}
        onChange={v => setReleaseForm({...releaseForm, baseDomain: v})}
        error={errors.baseDomain}
      />
      
      <ToggleField
        label="Enable HTTPS"
        description="Automatically provision and renew SSL certificates via Caddy"
        checked={releaseForm.httpsEnabled}
        onCheckedChange={v => setReleaseForm({...releaseForm, httpsEnabled: v})}
      />
      
      <ConditionalField show={releaseForm.httpsEnabled}>
        <SelectField
          label="Certificate Provider"
          description="Let's Encrypt or ZeroSSL"
          options={[
            { value: 'letsencrypt', label: "Let's Encrypt" },
            { value: 'zerossl', label: 'ZeroSSL' },
            { value: 'custom', label: 'Custom Certificate' },
          ]}
          value={releaseForm.certProvider}
          onChange={v => setReleaseForm({...releaseForm, certProvider: v})}
        />
        
        {releaseForm.certProvider === 'custom' && (
          <FieldGroup>
            <TextField
              label="Certificate Path"
              placeholder="/path/to/cert.pem"
              value={releaseForm.certPath}
              onChange={v => setReleaseForm({...releaseForm, certPath: v})}
            />
            <TextField
              label="Private Key Path"
              placeholder="/path/to/key.pem"
              value={releaseForm.keyPath}
              onChange={v => setReleaseForm({...releaseForm, keyPath: v})}
            />
          </FieldGroup>
        )}
      </ConditionalField>
      
      <ArrayField
        label="Additional Domains"
        description="Alternate domains that should route to this release"
        values={releaseForm.additionalDomains}
        onChange={v => setReleaseForm({...releaseForm, additionalDomains: v})}
        placeholder="example.com"
        addButtonText="Add Domain"
        maxItems={10}
      />
    </FieldGroup>
  </CategorySection>
  
  <CategorySection
    title="Deployment Status"
    description="Current rendering and deployment status for this release"
  >
    <div className="space-y-4">
      {release.deploymentStatus === 'rendering' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Rendering Templates</AlertTitle>
          <AlertDescription>
            Your configuration is being rendered into deployment files.
            This usually takes 30-60 seconds.
          </AlertDescription>
        </Alert>
      )}
      
      {release.deploymentStatus === 'ready' && (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Ready to Deploy</AlertTitle>
          <AlertDescription>
            Your configuration has been rendered and is ready for deployment.
          </AlertDescription>
        </Alert>
      )}
      
      {release.deploymentStatus === 'deployed' && (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Deployed</AlertTitle>
          <AlertDescription>
            This release is currently deployed and active.
            Last deployed {formatDate(release.lastDeployedAt)}.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(`/releases/${release.id}/deploy`)}
        >
          View Deployment Details
        </Button>
        
        {release.deploymentStatus === 'ready' && (
          <Button onClick={deployRelease}>
            <Rocket className="h-4 w-4 mr-2" />
            Deploy Now
          </Button>
        )}
      </div>
    </div>
  </CategorySection>
  
  <CategorySection
    title="Archive Release"
    description="Archive this release to remove it from active use while preserving its configuration"
  >
    <FieldGroup>
      <p className="text-sm text-muted-foreground mb-4">
        Archived releases can be restored at any time. They will no longer appear
        in the main releases list but can be accessed via the archive view.
      </p>
      <Button
        variant="outline"
        onClick={archiveRelease}
        disabled={release.status === 'deployed'}
      >
        Archive Release
      </Button>
      {release.status === 'deployed' && (
        <p className="text-xs text-muted-foreground mt-2">
          Cannot archive a deployed release. Please deploy a different release first.
        </p>
      )}
    </FieldGroup>
    <DocumentationLink href="https://docs.leger.run/releases/archiving">
      Learn more about Archiving
    </DocumentationLink>
  </CategorySection>
  
  <CategorySection
    title="Delete Release"
    description="Permanently delete this release and all of its contents from the Leger platform"
    className="border-destructive"
  >
    <FieldGroup>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This action is not reversible and can not be undone. The release will be
          permanently deleted, including its deployments and domains.
        </AlertDescription>
      </Alert>
      
      <div className="mt-4 p-4 border border-muted rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{release.name}</p>
            <p className="text-sm text-muted-foreground">
              Last updated {formatDate(release.updatedAt)}
            </p>
          </div>
          {release.status === 'deployed' && (
            <Badge variant="destructive">Currently Deployed</Badge>
          )}
        </div>
      </div>
      
      <DangerousActionButton
        onClick={openDeleteConfirmation}
        disabled={release.status === 'deployed'}
      >
        Delete Release
      </DangerousActionButton>
      
      {release.status === 'deployed' && (
        <p className="text-xs text-muted-foreground mt-2">
          Cannot delete a deployed release. Please deploy a different release first.
        </p>
      )}
    </FieldGroup>
  </CategorySection>
</PageLayout>
```

**Key Patterns:**
- Similar structure to account settings (accountsettings2)
- Each aspect of release meta-configuration in separate CategorySection
- Independent save buttons per section
- Destructive actions (delete) at bottom with visual distinction
- Status indicators for deployment state
- Conditional disabling of actions based on release state
- Links to detailed deployment status page

---

### Page: Deployment Status (`/releases/:id/deploy`)

**Screenshot References:** domain6

**Layout Type:** Full-width with progress indicators and status cards

**Purpose:** Show detailed rendering and deployment status, similar to how Vercel shows domain verification progress

**Component Structure:**
```typescript
<PageLayout>
  <Breadcrumb>
    <BreadcrumbItem>
      <Link to="/releases">Releases</Link>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <Link to={`/releases/${release.id}`}>{release.name}</Link>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem current>Deployment Status</BreadcrumbItem>
  </Breadcrumb>
  
  <PageHeader
    title="Deployment Status"
    description={`Tracking deployment progress for ${release.name}`}
  />
  
  {/* Overall Progress Card */}
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Deployment Progress</CardTitle>
      <CardDescription>
        {deploymentPhase === 'complete' 
          ? 'Your release has been successfully deployed'
          : 'Your release is being prepared for deployment'}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Progress value={overallProgress} className="h-3 mb-2" />
      <p className="text-sm text-muted-foreground">
        {overallProgress}% complete
      </p>
    </CardContent>
  </Card>
  
  {/* Step-by-Step Status */}
  <div className="space-y-4">
    {/* Step 1: Template Rendering */}
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {renderingStatus === 'complete' && (
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
            )}
            {renderingStatus === 'in-progress' && (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mt-1" />
            )}
            {renderingStatus === 'pending' && (
              <Clock className="h-5 w-5 text-muted-foreground mt-1" />
            )}
            <div>
              <CardTitle className="text-base">Rendering Templates</CardTitle>
              <CardDescription>
                Applying your configuration to Quadlet templates
              </CardDescription>
            </div>
          </div>
          {renderingStatus === 'complete' && (
            <Badge variant="secondary">Complete</Badge>
          )}
          {renderingStatus === 'in-progress' && (
            <Badge>In Progress</Badge>
          )}
        </div>
      </CardHeader>
      {renderingStatus !== 'pending' && (
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Templates rendered:</span>
              <span className="font-medium">{renderedCount} / {totalTemplates}</span>
            </div>
            {renderingStatus === 'complete' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{renderingDuration}s</span>
              </div>
            )}
          </div>
          
          {renderingErrors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Rendering Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {renderingErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
    
    {/* Step 2: Upload to R2 */}
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {uploadStatus === 'complete' && (
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
            )}
            {uploadStatus === 'in-progress' && (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mt-1" />
            )}
            {uploadStatus === 'pending' && (
              <Clock className="h-5 w-5 text-muted-foreground mt-1" />
            )}
            <div>
              <CardTitle className="text-base">Upload to Storage</CardTitle>
              <CardDescription>
                Uploading rendered files to Cloudflare R2
              </CardDescription>
            </div>
          </div>
          {uploadStatus === 'complete' && (
            <Badge variant="secondary">Complete</Badge>
          )}
          {uploadStatus === 'in-progress' && (
            <Badge>In Progress</Badge>
          )}
        </div>
      </CardHeader>
      {uploadStatus !== 'pending' && (
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Files uploaded:</span>
              <span className="font-medium">{uploadedCount} / {totalFiles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total size:</span>
              <span className="font-medium">{formatBytes(totalSize)}</span>
            </div>
            {uploadStatus === 'in-progress' && (
              <Progress value={uploadProgress} className="h-2 mt-2" />
            )}
          </div>
        </CardContent>
      )}
    </Card>
    
    {/* Step 3: Manifest Generation */}
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {manifestStatus === 'complete' && (
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
            )}
            {manifestStatus === 'in-progress' && (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mt-1" />
            )}
            {manifestStatus === 'pending' && (
              <Clock className="h-5 w-5 text-muted-foreground mt-1" />
            )}
            <div>
              <CardTitle className="text-base">Generate Manifest</CardTitle>
              <CardDescription>
                Creating deployment manifest for CLI
              </CardDescription>
            </div>
          </div>
          {manifestStatus === 'complete' && (
            <Badge variant="secondary">Complete</Badge>
          )}
        </div>
      </CardHeader>
      {manifestStatus === 'complete' && (
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded">
              manifest-v{release.version}.json
            </code>
            <Button variant="ghost" size="icon" onClick={downloadManifest}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  </div>
  
  {/* Action Buttons */}
  <div className="mt-8 flex gap-4">
    {overallProgress === 100 && (
      <>
        <Button onClick={() => navigate(`/releases/${release.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Configuration
        </Button>
        <Button variant="outline" onClick={downloadAllFiles}>
          <Download className="h-4 w-4 mr-2" />
          Download All Files
        </Button>
      </>
    )}
    {overallProgress < 100 && (
      <Button variant="outline" onClick={cancelDeployment}>
        Cancel Deployment
      </Button>
    )}
  </div>
  
  {/* CLI Instructions (when complete) */}
  {overallProgress === 100 && (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Deploy with CLI</CardTitle>
        <CardDescription>
          Use the Leger CLI to deploy this release to your infrastructure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-lg font-mono text-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-2">$ leger auth login</p>
              <p className="mb-2">$ leger deploy install --release {release.id}</p>
              <p>$ leger deploy start</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(cliCommands)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )}
</PageLayout>
```

**Key Patterns:**
- Similar to Vercel's domain verification progress (domain6)
- Multi-step process with visual status indicators
- Each step shows: pending, in-progress, or complete state
- Progress bars for long-running operations
- Error display when issues occur
- CLI instructions appear when ready
- Download options for manifest and files

---

### Page: Marketplace (`/marketplace`)

**Screenshot References:** integrations-marketplace1, integrations-marketplace2

**Layout Type:** Grid/card view with filters and search

**Purpose:** Browse and install third-party integrations and services

**Component Structure:**
```typescript
<PageLayout>
  <PageHeader
    title="Integrations Marketplace"
    description="Extend your Leger deployments with third-party integrations and services"
  />
  
  {/* Search and Filters */}
  <div className="mb-8 space-y-4">
    <div className="flex gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>
      <SelectField
        label="Category"
        options={[
          { value: 'all', label: 'All Categories' },
          { value: 'ai', label: 'AI & Machine Learning' },
          { value: 'storage', label: 'Storage & Databases' },
          { value: 'monitoring', label: 'Monitoring & Analytics' },
          { value: 'security', label: 'Security' },
          { value: 'deployment', label: 'Deployment Tools' },
        ]}
        value={categoryFilter}
        onChange={setCategoryFilter}
        inline
      />
      <SelectField
        label="Sort"
        options={[
          { value: 'popular', label: 'Most Popular' },
          { value: 'recent', label: 'Recently Added' },
          { value: 'name', label: 'Name' },
        ]}
        value={sortOrder}
        onChange={setSortOrder}
        inline
      />
    </div>
    
    {/* Category Tags */}
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={categoryFilter === 'all' ? 'default' : 'outline'}
        className="cursor-pointer"
        onClick={() => setCategoryFilter('all')}
      >
        All
      </Badge>
      <Badge
        variant={categoryFilter === 'ai' ? 'default' : 'outline'}
        className="cursor-pointer"
        onClick={() => setCategoryFilter('ai')}
      >
        AI & ML
      </Badge>
      {/* More category badges */}
    </div>
  </div>
  
  {/* Integration Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {integrations.map(integration => (
      <Card
        key={integration.id}
        className="hover:border-primary transition-colors cursor-pointer"
        onClick={() => navigate(`/marketplace/${integration.id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              {integration.icon ? (
                <img src={integration.icon} alt="" className="w-8 h-8" />
              ) : (
                <Package className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <Badge variant="secondary">{integration.category}</Badge>
          </div>
          <CardTitle>{integration.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {integration.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{integration.installCount} installs</span>
            </div>
            {integration.verified && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Verified</span>
              </div>
            )}
          </div>
          
          {integration.tags && (
            <div className="flex flex-wrap gap-1 mt-3">
              {integration.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant={integration.installed ? 'outline' : 'default'}
            onClick={(e) => {
              e.stopPropagation();
              integration.installed
                ? manageIntegration(integration.id)
                : openInstallModal(integration.id);
            }}
          >
            {integration.installed ? (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Install
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
  
  {/* Empty State */}
  {integrations.length === 0 && (
    <div className="text-center py-12">
      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
      <p className="text-muted-foreground mb-4">
        Try adjusting your search or filters
      </p>
      <Button variant="outline" onClick={resetFilters}>
        Clear Filters
      </Button>
    </div>
  )}
</PageLayout>
```

**Key Patterns:**
- Grid layout similar to releases
- Each integration shows: icon, name, description, category, install count
- Verified badge for trusted integrations
- Tags for additional categorization
- Search and category filtering
- Install button directly on card
- Click card to see details

---

### Page: Marketplace Detail (`/marketplace/:id`)

**Screenshot References:** integrations-marketplace1

**Layout Type:** Two-column layout (details + sidebar)

**Purpose:** Detailed view of a specific integration with installation options

**Component Structure:**
```typescript
<PageLayout>
  <Breadcrumb>
    <BreadcrumbItem>
      <Link to="/marketplace">Marketplace</Link>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem current>{integration.name}</BreadcrumbItem>
  </Breadcrumb>
  
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
    {/* Main Content - Left Column (2/3 width) */}
    <div className="lg:col-span-2 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
            {integration.icon ? (
              <img src={integration.icon} alt="" className="w-12 h-12" />
            ) : (
              <Package className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{integration.name}</h1>
                <p className="text-muted-foreground">{integration.tagline}</p>
              </div>
              {integration.verified && (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{integration.installCount} installs</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Updated {formatDate(integration.updatedAt)}</span>
          </div>
          <Badge variant="secondary">{integration.category}</Badge>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {integration.description}
            </div>
          </div>
          
          {/* Features */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Features</h2>
            <ul className="space-y-2">
              {integration.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Screenshots */}
          {integration.screenshots && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Screenshots</h2>
              <div className="grid grid-cols-2 gap-4">
                {integration.screenshots.map((screenshot, i) => (
                  <img
                    key={i}
                    src={screenshot}
                    alt={`Screenshot ${i + 1}`}
                    className="rounded-lg border"
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="documentation">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {integration.documentation}
          </div>
        </TabsContent>
        
        <TabsContent value="changelog">
          <div className="space-y-4">
            {integration.changelog.map((entry, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{entry.version}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {entry.changes.map((change, j) => (
                    <li key={j}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    
    {/* Sidebar - Right Column (1/3 width) */}
    <div className="space-y-6">
      {/* Install Card */}
      <Card>
        <CardHeader>
          <CardTitle>Installation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!integration.installed ? (
            <>
              <p className="text-sm text-muted-foreground">
                Add this integration to a release to get started
              </p>
              <Button
                className="w-full"
                onClick={openInstallModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Install Integration
              </Button>
            </>
          ) : (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Installed</AlertTitle>
                <AlertDescription>
                  This integration is installed in {integration.installedCount} release(s)
                </AlertDescription>
              </Alert>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate(`/releases?integration=${integration.id}`)}
              >
                View Releases
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={openInstallModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Another Release
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Version</p>
            <p className="font-medium">{integration.version}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Publisher</p>
            <p className="font-medium">{integration.publisher}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">License</p>
            <p className="font-medium">{integration.license}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Support</p>
            <Button variant="link" asChild className="p-0 h-auto">
              <a href={integration.supportUrl} target="_blank" rel="noopener noreferrer">
                Get Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Tags */}
      {integration.tags && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {integration.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {integration.homepage && (
            <Button variant="link" asChild className="p-0 h-auto justify-start">
              <a href={integration.homepage} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Homepage
              </a>
            </Button>
          )}
          {integration.repository && (
            <Button variant="link" asChild className="p-0 h-auto justify-start">
              <a href={integration.repository} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                Source Code
              </a>
            </Button>
          )}
          {integration.documentation && (
            <Button variant="link" asChild className="p-0 h-auto justify-start">
              <a href={integration.documentationUrl} target="_blank" rel="noopener noreferrer">
                <Book className="h-4 w-4 mr-2" />
                Documentation
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
  
  {/* Install Modal */}
  {showInstallModal && (
    <InstallIntegrationModal
      integration={integration}
      isOpen={showInstallModal}
      onClose={() => setShowInstallModal(false)}
      onInstall={handleInstall}
    />
  )}
</PageLayout>
```

**Key Patterns:**
- Two-column layout: main content (2/3) + sidebar (1/3)
- Tabs for different content types (overview, docs, changelog)
- Install button prominent in sidebar
- Metadata and links in sidebar cards
- Verified badge for trust signals
- Screenshots in grid layout
- Features list with checkmarks

---

### Page: Settings (`/settings`)

**Screenshot References:** accountsettings2, security1, security2

**Layout Type:** Sidebar navigation + single scrollable page with section anchors

**Purpose:** Account settings, Tailscale configuration, Cockpit enablement, account management

**Component Structure:**
```typescript
<PageLayout>
  <div className="flex min-h-screen">
    {/* Left Sidebar Navigation */}
    <aside className="w-64 border-r bg-muted/50 sticky top-0 h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="font-semibold mb-4">Settings</h2>
        
        <HierarchicalNavigation
          sections={[
            {
              id: 'profile',
              label: 'Profile',
              isExpanded: true,
              subsections: [
                { id: 'avatar', label: 'Avatar', anchor: '#avatar' },
                { id: 'display-name', label: 'Display Name', anchor: '#display-name' },
                { id: 'username', label: 'Username', anchor: '#username' },
              ]
            },
            {
              id: 'tailscale',
              label: 'Tailscale Network',
              isExpanded: false,
              subsections: [
                { id: 'tailscale-account', label: 'Account', anchor: '#tailscale-account' },
                { id: 'tailscale-status', label: 'Connection Status', anchor: '#tailscale-status' },
              ]
            },
            {
              id: 'integrations',
              label: 'Integrations',
              isExpanded: false,
              subsections: [
                { id: 'cockpit', label: 'Cockpit Monitoring', anchor: '#cockpit-enablement' },
              ]
            },
            {
              id: 'account',
              label: 'Account',
              isExpanded: false,
              subsections: [
                { id: 'leger-id', label: 'Leger ID', anchor: '#account-id' },
                { id: 'delete', label: 'Delete Account', anchor: '#delete-account' },
              ]
            }
          ]}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
        />
      </div>
    </aside>
    
    {/* Main Content */}
    <main className="flex-1 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Avatar Section */}
        <div id="avatar">
          <CategorySection
            title="Avatar"
            description="This is your avatar. Click on the avatar to upload a custom one from your files."
            isDirty={avatarDirty}
            onSave={saveAvatar}
          >
            <div className="flex items-start gap-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  An avatar is optional but strongly recommended.
                </p>
                {avatarFile && (
                  <p className="text-sm">
                    Selected: {avatarFile.name}
                  </p>
                )}
              </div>
            </div>
          </CategorySection>
        </div>
        
        {/* Display Name Section */}
        <div id="display-name">
          <CategorySection
            title="Display Name"
            description="Please enter your full name, or a display name you are comfortable with."
            isDirty={displayNameDirty}
            onSave={saveDisplayName}
          >
            <FieldGroup>
              <TextField
                label="Display Name"
                value={displayName}
                onChange={setDisplayName}
                maxLength={32}
                showCharCount
                error={errors.displayName}
              />
              <p className="text-sm text-muted-foreground">
                Please use 32 characters at maximum.
              </p>
            </FieldGroup>
          </CategorySection>
        </div>
        
        {/* Username Section */}
        <div id="username">
          <CategorySection
            title="Username"
            description="This is your URL namespace within Leger."
            isDirty={usernameDirty}
            onSave={saveUsername}
          >
            <FieldGroup>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">leger.run/</span>
                <TextField
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  maxLength={48}
                  showCharCount
                  error={errors.username}
                  hideLabel
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Please use 48 characters at maximum.
              </p>
            </FieldGroup>
          </CategorySection>
        </div>
        
        {/* Tailscale Account Section */}
        <div id="tailscale-account">
          <CategorySection
            title="Tailscale Network"
            description="Your Tailscale network configuration and authentication status"
          >
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Global Configuration</AlertTitle>
                <AlertDescription>
                  Tailscale configuration is managed globally for your account.
                  All releases use the same Tailscale network for authentication.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Tailnet</p>
                    <p className="text-sm text-muted-foreground">{tailnet}</p>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{tailscaleEmail}</p>
                  </div>
                  <Badge variant="secondary">Verified</Badge>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{tailscaleUserId}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(tailscaleUserId)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button variant="outline" onClick={refreshTailscaleStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
            <DocumentationLink href="https://docs.leger.run/authentication/tailscale">
              Learn more about Tailscale integration
            </DocumentationLink>
          </CategorySection>
        </div>
        
        {/* Cockpit Enablement Section */}
        <div id="cockpit-enablement">
          <CategorySection
            title="Cockpit Monitoring"
            description="Enable Cockpit monitoring for your deployments to track performance and logs"
            isDirty={cockpitDirty}
            onSave={saveCockpit}
            documentationLink={{
              text: "Learn more about Cockpit",
              href: "https://docs.leger.run/monitoring/cockpit"
            }}
          >
            <FieldGroup>
              <ToggleField
                label="Enable Cockpit"
                description="Activate monitoring and logging for your deployments"
                checked={cockpitEnabled}
                onCheckedChange={setCockpitEnabled}
              />
              
              <ConditionalField show={cockpitEnabled} animation>
                <SelectField
                  label="Data Retention Period"
                  description="How long to keep monitoring data and logs"
                  options={[
                    { value: '7', label: '7 days (Free)' },
                    { value: '30', label: '30 days (Pro)' },
                    { value: '90', label: '90 days (Enterprise)' },
                  ]}
                  value={cockpitRetention}
                  onChange={setCockpitRetention}
                />
                
                <TextField
                  label="Webhook URL"
                  description="Optional: Receive alerts via webhook"
                  placeholder="https://your-webhook-endpoint.com/alerts"
                  value={cockpitWebhook}
                  onChange={setCockpitWebhook}
                  optional
                />
                
                <ToggleField
                  label="Send Email Alerts"
                  description="Receive critical alerts via email"
                  checked={cockpitEmailAlerts}
                  onCheckedChange={setCockpitEmailAlerts}
                />
              </ConditionalField>
            </FieldGroup>
          </CategorySection>
        </div>
        
        {/* Leger ID Section */}
        <div id="account-id">
          <CategorySection
            title="Leger ID"
            description="This is your user ID within Leger."
          >
            <FieldGroup>
              <div className="flex items-center gap-2">
                <Input
                  value={legerId}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(legerId)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Used when interacting with the Leger API.
              </p>
            </FieldGroup>
            <DocumentationLink href="https://docs.leger.run/api/authentication">
              Learn more about Leger ID
            </DocumentationLink>
          </CategorySection>
        </div>
        
        {/* Delete Account Section */}
        <div id="delete-account">
          <CategorySection
            title="Delete Account"
            description="Permanently remove your Personal Account and all of its contents from the Leger platform"
            className="border-destructive"
          >
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action is not reversible. Please be certain.
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-muted-foreground mb-4">
              Permanently remove your Personal Account and all of its contents from
              the Leger platform. This action is not reversible, so please continue
              with caution.
            </p>
            
            <DangerousActionButton onClick={openDeleteConfirmation}>
              Delete Personal Account
            </DangerousActionButton>
          </CategorySection>
        </div>
      </div>
    </main>
  </div>
</PageLayout>
```

**Key Patterns:**
- Sidebar navigation with collapsible sections (like accountsettings2)
- All content on single scrollable page with hash anchors
- Each setting in a CategorySection with independent save button
- Tailscale section shows global configuration (read-only with refresh)
- Cockpit section uses toggle-based conditional disclosure (like security1/security2)
- Destructive action (delete) at bottom with red styling
- Documentation links in relevant sections

---

## Screenshot Reference Map

Mapping screenshots to page implementations:

| Screenshot | Page(s) | Key Pattern Demonstrated |
|------------|---------|--------------------------|
| **accountsettings2** | `/settings` | Vertical CategorySection stacking, independent save buttons, destructive action at bottom |
| **security1** | `/settings` (Cockpit section) | Toggle-driven conditional disclosure, enabled state |
| **security2** | `/settings` (Cockpit section) | Toggle-driven conditional disclosure, disabled state |
| **env4** | `/api-keys` | Table-based listing (environment variables), add button |
| **env6** | `/api-keys` | Environment variable edit form, conditional fields |
| **env7** | `/api-keys` | Environment variable table with actions dropdown |
| **integrations-marketplace1** | `/marketplace/:id` | Integration detail page, two-column layout |
| **integrations-marketplace2** | `/marketplace` | Marketplace grid view, integration cards |
| **main-config-management1** | `/releases`, `/releases/:id` | Release list and configuration form |
| **project-settings2** | `/releases/:id/settings` | Release meta settings, similar to account settings pattern |
| **domain6** | `/releases/:id/deploy` | Multi-step progress tracking, status indicators |

---

## Navigation Behaviors

### Active State Indication

**Primary Navigation (Row 2)**:
- Current page underlined or highlighted background
- Hover state: subtle background change
- Visited pages: no special indication

**Sidebar Navigation (Settings, Release Edit)**:
- Current section highlighted with primary color
- Bold text for active section
- Smooth scroll animation when clicking section link
- Scrollspy updates active section as user scrolls

### Breadcrumb Behavior

**Standard Breadcrumbs**:
```
Releases / Release Name / Settings
  ↑         ↑             ↑
  Link      Link          Current (not linked)
```

**Breadcrumb with Dropdown** (Environment switcher pattern):
```
Releases / [Environment ▼] / Variables
            └─ Dropdown shows:
               • Production
               • Preview
               • Development
```

- Clicking breadcrumb item navigates to that level
- Current page shown in normal weight, not clickable
- Dropdown allows context switching without full navigation

### Back Button Behavior

Browser back button should work naturally:
- Navigate between pages normally
- Hash navigation (section anchors) works with back button
- Overlay/modal state does NOT create history entry
- URL state (query params) creates history entry

### Keyboard Navigation

**Global Shortcuts**:
- `/` - Focus search input
- `Esc` - Close modal/overlay, cancel edit
- `Ctrl/Cmd + S` - Save current section (when dirty)
- `Ctrl/Cmd + K` - Command palette (future feature)

**Form Navigation**:
- `Tab` - Move between fields naturally
- `Enter` - Submit in modals, add item in arrays
- `Esc` - Cancel edit, close modal

**List Navigation**:
- `↑` `↓` - Navigate dropdown options
- `Enter` - Select option
- `Esc` - Close dropdown

---

## Component Assembly Patterns

### CategorySection Assembly

Standard pattern for all major settings/config sections:

```typescript
<CategorySection
  title="Section Title"
  description="Brief description of section purpose"
  isDirty={sectionDirty}
  isLoading={saving}
  onSave={saveSection}
  saveText="Save Changes"
  documentationLink={{
    text: "Learn more about Feature",
    href: "https://docs.leger.run/feature"
  }}
>
  <FieldGroup>
    {/* Field components */}
  </FieldGroup>
</CategorySection>
```

**Usage Locations**:
- API Keys page: One section per provider
- Settings page: One section per setting category
- Release settings: One section per meta-config aspect

### Modal/Overlay Assembly

Standard pattern for modal dialogs:

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>
        Brief description of modal purpose
      </DialogDescription>
    </DialogHeader>
    
    <FieldGroup>
      {/* Form fields */}
    </FieldGroup>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>
        Confirm Action
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Usage Locations**:
- Add custom API endpoint
- Install integration
- Delete confirmations
- Quick edit forms

### Table Assembly

Standard pattern for data tables:

```typescript
<div className="space-y-4">
  {/* Search/Filters */}
  <div className="flex gap-4">
    <Input placeholder="Search..." />
    <SelectField options={filterOptions} />
  </div>
  
  {/* Table */}
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Column 1</TableHead>
        <TableHead>Column 2</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.value}</TableCell>
          <TableCell>
            <DropdownMenu>
              {/* Actions */}
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  
  {/* Empty State */}
  {items.length === 0 && (
    <div className="text-center py-8">
      <p>No items found</p>
    </div>
  )}
</div>
```

**Usage Locations**:
- Custom API endpoints table
- Environment variables (future)
- Integration installations (future)

---

## State Management Requirements

### URL State (Router State)

What belongs in the URL:

**Path Parameters**:
- `/releases/:id` - Current release ID
- `/marketplace/:id` - Current integration ID

**Query Parameters**:
- `?provider=` - Filter by provider (API keys)
- `?status=` - Filter by status (releases)
- `?category=` - Filter by category (marketplace)
- `?sort=` - Sort order
- `?action=install` - Trigger action/overlay

**Hash Fragments**:
- `#section-name` - Scroll position in long forms
- Used in Settings page and Release edit page

### Local State (Component State)

What stays in component state:

**Form State**:
- Current field values
- Field validation errors
- Dirty state per section
- File upload progress

**UI State**:
- Modal open/closed
- Dropdown expanded/collapsed
- Sidebar sections expanded/collapsed
- Active tab in multi-tab views
- Search/filter inputs

**Temporary State**:
- Loading indicators
- Hover states
- Focus states
- Validation in progress

### Persistent State (Backend/LocalStorage)

What needs to persist:

**Backend State**:
- Configuration data
- API keys (encrypted)
- Release configurations
- User settings
- Installation status

**LocalStorage State**:
- UI preferences (sidebar collapsed)
- Recent searches
- Draft form data (auto-save)
- Selected theme

### State Synchronization

**Auto-save Pattern** (for release configuration):
```typescript
// Debounced auto-save
const debouncedSave = useDebouncedCallback(
  (formData) => saveToBackend(formData),
  2000 // 2 second debounce
);

// On form change
const handleFormChange = (newData) => {
  setFormData(newData);
  debouncedSave(newData);
  setIsDirty(true);
};
```

**Explicit Save Pattern** (for settings):
```typescript
// Track original vs current
const [originalData, setOriginalData] = useState(initialData);
const [currentData, setCurrentData] = useState(initialData);

const isDirty = !isEqual(originalData, currentData);

const handleSave = async () => {
  await saveToBackend(currentData);
  setOriginalData(currentData);
  setIsDirty(false);
};
```

---

## Interaction Flow Patterns

### Create Release Flow

1. User clicks "Create New Release" button on `/releases`
2. Navigates to `/releases/new`
3. RJSF form loads with schema defaults
4. User fills out configuration sections (any order)
5. Each section auto-saves as user works
6. Completion indicator shows progress
7. When satisfied, user can navigate to deployment status
8. Templates render in background
9. Files upload to R2
10. Manifest generated
11. CLI commands shown for deployment

### Install Integration Flow

**From Marketplace Page**:
1. User browses `/marketplace`
2. Clicks integration card
3. Views detail page `/marketplace/:id`
4. Clicks "Install" button
5. Modal opens with configuration options
6. User selects target release(s)
7. Configures integration settings
8. Clicks "Install Integration"
9. Integration added to release(s)
10. Success message with link to release

**From Release Configuration Page**:
1. User editing release at `/releases/:id`
2. Sees marketplace prompt or clicks overlay trigger
3. Marketplace overlay opens (maintains scroll position)
4. User searches/browses integrations
5. Clicks integration to see details
6. Clicks "Install to This Release"
7. Configuration modal opens
8. User configures integration
9. Integration added to current release automatically
10. Overlay closes, returns to exact scroll position
11. New integration section appears in form

### Add API Key Flow

1. User navigates to `/api-keys`
2. Scrolls to provider section (e.g., OpenAI)
3. Enters API key in SecretField
4. Key is masked by default
5. User can toggle visibility to verify
6. Optional: enters additional fields (org ID)
7. Section shows as dirty
8. User clicks "Save" button
9. Key encrypted and saved to backend
10. Success toast appears
11. Section no longer dirty
12. Key remains masked

### Deploy Release Flow

1. User creates/edits release
2. Configuration complete (all required fields)
3. User clicks "View Deployment Status" or saves final changes
4. Navigates to `/releases/:id/deploy`
5. Backend begins template rendering
6. Progress indicator shows rendering step
7. Templates complete, files upload to R2
8. Progress indicator shows upload step
9. Manifest generated
10. All steps complete
11. CLI instructions appear
12. User copies commands
13. Runs commands on target machine
14. Deployment completes

---

## End of Sitemap

This sitemap serves as the definitive guide for Leger's web application structure, navigation patterns, and page compositions. It complements the existing technical documentation and component catalogue to provide a complete picture of the application's information architecture.
