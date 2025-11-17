import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MetaTags } from '@/components/MetaTags'

export default function CookiesPage() {
  return (
    <AppLayout>
      <MetaTags
        title="Cookie Policy"
        description="Understand how Umbrella uses cookies and similar technologies to enhance your experience and improve our services."
        url="/legal/cookies"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: November 17, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Cookies are small text files that are placed on your device when you visit a website.
                They are widely used to make websites work more efficiently and provide information to
                the website owners.
              </p>
              <p>
                We use cookies and similar technologies to enhance your experience, keep you logged in,
                remember your preferences, and understand how you use our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-2">Essential Cookies</h3>
              <p>
                These cookies are necessary for the website to function properly. They enable core
                functionality such as security, authentication, and session management. You cannot opt
                out of these cookies.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Preference Cookies</h3>
              <p>
                These cookies allow the website to remember your choices (such as theme preference) to
                provide a more personalized experience.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Analytics Cookies</h3>
              <p>
                These cookies help us understand how visitors interact with our website by collecting
                and reporting information anonymously. This helps us improve the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cookie Name</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">__session</TableCell>
                    <TableCell>
                      Authentication session cookie (Clerk). Required for login and security.
                    </TableCell>
                    <TableCell>Session (expires when you close browser)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">__client_uat</TableCell>
                    <TableCell>
                      Client update timestamp (Clerk). Used for session synchronization.
                    </TableCell>
                    <TableCell>Session</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">cookie_consent</TableCell>
                    <TableCell>
                      Stores your cookie consent preference.
                    </TableCell>
                    <TableCell>1 year</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">umbrella-theme</TableCell>
                    <TableCell>
                      Stores your theme preference (light/dark mode).
                    </TableCell>
                    <TableCell>Persistent (no expiration)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">_cf_*</TableCell>
                    <TableCell>
                      Cloudflare security and performance cookies. Used for DDoS protection and
                      traffic management.
                    </TableCell>
                    <TableCell>Varies (typically 1-30 days)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Control Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                You can control and manage cookies in several ways:
              </p>

              <h3 className="text-lg font-semibold mb-2">Browser Settings</h3>
              <p>
                Most browsers allow you to refuse or accept cookies through their settings. Please
                note that if you disable essential cookies, some parts of the website may not function
                properly.
              </p>
              <ul>
                <li>
                  <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
                </li>
                <li>
                  <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
                </li>
                <li>
                  <strong>Safari:</strong> Preferences → Privacy → Cookies and website data
                </li>
                <li>
                  <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">Cookie Consent Banner</h3>
              <p>
                When you first visit our website, you'll see a cookie consent banner. By clicking
                "Accept," you consent to our use of cookies as described in this policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Some cookies are placed by third-party services that appear on our pages:
              </p>
              <ul>
                <li>
                  <strong>Clerk</strong> - Authentication service that sets cookies for login sessions
                </li>
                <li>
                  <strong>Cloudflare</strong> - Infrastructure provider that sets cookies for security
                  and performance
                </li>
              </ul>
              <p>
                These third parties have their own privacy policies, and we have no control over their
                cookies. We recommend reviewing their policies:
              </p>
              <ul>
                <li>
                  <a
                    href="https://clerk.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Clerk Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.cloudflare.com/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Cloudflare Privacy Policy
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices
                or for other operational, legal, or regulatory reasons. Please check this page
                periodically for updates.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@umbrella.app" className="text-primary hover:underline">
                privacy@umbrella.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
