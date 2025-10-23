import type { Story } from "@ladle/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./AppLayout";

// Mock auth provider for stories
const MockAuthProvider = ({ children, testMode = false }: { children: React.ReactNode; testMode?: boolean }) => {
  // Mock the auth context
  const mockUser = {
    email: "demo@example.com",
    tailnet: "demo-tailnet",
  };

  // Mock session for test mode
  if (testMode) {
    localStorage.setItem('test-mode', 'true');
  } else {
    localStorage.removeItem('test-mode');
  }

  // Create a minimal auth context
  const AuthContext = React.createContext({
    user: mockUser,
    logout: () => console.log('Logout clicked'),
  });

  return <AuthContext.Provider value={{ user: mockUser, logout: () => console.log('Logout') }}>{children}</AuthContext.Provider>;
};

export const Default: Story = () => {
  return (
    <BrowserRouter>
      <MockAuthProvider>
        <Routes>
          <Route path="*" element={<AppLayout />}>
            <Route index element={
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Welcome to Leger</h2>
                <p className="text-muted-foreground">
                  This is the default app layout with two-row header navigation.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>• Row 1: Global context with logo, external links, theme toggle, and user menu</li>
                  <li>• Row 2: Primary navigation (sticky) - stays at top when scrolling</li>
                  <li>• Main content area renders child routes</li>
                </ul>
              </div>
            } />
          </Route>
        </Routes>
      </MockAuthProvider>
    </BrowserRouter>
  );
};

export const WithTestModeBanner: Story = () => {
  return (
    <BrowserRouter>
      <MockAuthProvider testMode>
        <Routes>
          <Route path="*" element={<AppLayout />}>
            <Route index element={
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Test Mode Active</h2>
                <p className="text-muted-foreground mb-4">
                  When in test mode, a banner appears at the top indicating you're using a test user.
                </p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm font-medium">Test Mode Features:</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Amber-colored banner at the very top</li>
                    <li>• Visible alert icon and message</li>
                    <li>• Automatically detected from session</li>
                  </ul>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </MockAuthProvider>
    </BrowserRouter>
  );
};

export const NavigationStates: Story = () => {
  return (
    <BrowserRouter>
      <MockAuthProvider>
        <Routes>
          <Route path="*" element={<AppLayout />}>
            <Route path="api-keys" element={
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">API Keys Page</h2>
                <p className="text-muted-foreground">
                  Notice the "API Keys" link in the navigation is highlighted with an underline.
                </p>
              </div>
            } />
            <Route path="releases" element={
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Releases Page</h2>
                <p className="text-muted-foreground">
                  The active navigation link is indicated by text color and bottom border.
                </p>
              </div>
            } />
            <Route path="settings" element={
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Settings Page</h2>
                <p className="text-muted-foreground">
                  Navigate between pages to see the active state update.
                </p>
              </div>
            } />
            <Route index element={
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Navigation States Demo</h2>
                <p className="text-muted-foreground mb-4">
                  Click on different navigation items to see active states:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Active:</strong> Darker text with primary-colored bottom border</li>
                  <li>• <strong>Inactive:</strong> Muted text color</li>
                  <li>• <strong>Disabled:</strong> "Models" and "Marketplace" show "Soon" badges</li>
                  <li>• <strong>Hover:</strong> Color transitions to primary on hover</li>
                </ul>
              </div>
            } />
          </Route>
        </Routes>
      </MockAuthProvider>
    </BrowserRouter>
  );
};

export const StickyNavigation: Story = () => {
  return (
    <BrowserRouter>
      <MockAuthProvider>
        <Routes>
          <Route path="*" element={<AppLayout />}>
            <Route index element={
              <div className="p-6 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Sticky Navigation Demo</h2>
                  <p className="text-muted-foreground mb-4">
                    Scroll down this page to see the sticky navigation behavior:
                  </p>
                  <ul className="space-y-2 text-sm bg-muted p-4 rounded-md">
                    <li>• Row 1 (logo, links, user menu) scrolls away normally</li>
                    <li>• Row 2 (primary navigation) stays fixed at the top</li>
                    <li>• This provides easy access to navigation while scrolling</li>
                  </ul>
                </div>

                {/* Add lots of content to enable scrolling */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="bg-muted p-6 rounded-md">
                    <h3 className="font-semibold mb-2">Content Section {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                      quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                      consequat.
                    </p>
                  </div>
                ))}

                <div className="bg-primary/10 p-6 rounded-md">
                  <p className="text-sm font-medium">
                    Notice how the primary navigation (Row 2) stays at the top while you scroll!
                  </p>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </MockAuthProvider>
    </BrowserRouter>
  );
};

export const UserMenu: Story = () => {
  return (
    <BrowserRouter>
      <MockAuthProvider>
        <Routes>
          <Route path="*" element={<AppLayout />}>
            <Route index element={
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">User Menu</h2>
                <p className="text-muted-foreground mb-4">
                  Click the avatar in the top right to open the user menu:
                </p>
                <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
                  <p><strong>Avatar:</strong> Shows first letter of email</p>
                  <p><strong>Dropdown Content:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• User email address</li>
                    <li>• Tailnet identifier</li>
                    <li>• Logout action</li>
                  </ul>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </MockAuthProvider>
    </BrowserRouter>
  );
};

export const ExternalLinks: Story = () => {
  return (
    <BrowserRouter>
      <MockAuthProvider>
        <Routes>
          <Route path="*" element={<AppLayout />}>
            <Route index element={
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">External Links</h2>
                <p className="text-muted-foreground mb-4">
                  The top navigation bar includes external links that open in new tabs:
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span>⭐</span> GitHub Star
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Links to the GitHub repository with a prominent star button
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">📝 Changelog</h3>
                    <p className="text-sm text-muted-foreground">
                      View recent updates and new features
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">📚 Documentation</h3>
                    <p className="text-sm text-muted-foreground">
                      Access comprehensive documentation
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  All external links open in a new tab with rel="noopener noreferrer" for security
                </p>
              </div>
            } />
          </Route>
        </Routes>
      </MockAuthProvider>
    </BrowserRouter>
  );
};

export const ResponsiveBehavior: Story = () => {
  return (
    <BrowserRouter>
      <MockAuthProvider>
        <Routes>
          <Route path="*" element={<AppLayout />}>
            <Route index element={
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Responsive Layout</h2>
                <p className="text-muted-foreground mb-4">
                  The layout adapts to different screen sizes. Try resizing your browser window.
                </p>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Desktop (wide screens)</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• All navigation items visible</li>
                      <li>• External links fully displayed</li>
                      <li>• Optimal spacing and layout</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Mobile (narrow screens)</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Navigation adapts to smaller space</li>
                      <li>• Content remains accessible</li>
                      <li>• Touch-friendly tap targets</li>
                    </ul>
                  </div>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </MockAuthProvider>
    </BrowserRouter>
  );
};
