import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetaTags } from '@/components/MetaTags'

export default function PrivacyPage() {
  return (
    <AppLayout>
      <MetaTags
        title="Privacy Policy"
        description="Learn about how Umbrella collects, uses, and protects your personal information. Read our comprehensive Privacy Policy."
        url="/privacy"
      />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: November 17, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We collect information you provide directly to us, including:</p>
              <ul>
                <li>Account information (name, email address, password)</li>
                <li>Profile information (bio, location, genre, skills, photos)</li>
                <li>Content you upload (audio files, images, documents)</li>
                <li>Messages and communications with other users</li>
                <li>Payment and billing information</li>
                <li>Usage data and analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Create and manage your account</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Provide personalized content and recommendations</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We do not sell your personal information. We may share your information in the
                following circumstances:
              </p>
              <ul>
                <li>
                  With other users as part of the platform functionality (e.g., your public profile)
                </li>
                <li>With service providers who perform services on our behalf</li>
                <li>To comply with legal obligations</li>
                <li>
                  To protect the rights, property, and safety of Umbrella, our users, or others
                </li>
                <li>With your consent or at your direction</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We use the following third-party service providers to operate our platform. Each
                service has its own privacy policy:
              </p>
              <ul>
                <li>
                  <strong>Clerk</strong> - Authentication and user management. Processes account
                  information and login credentials.
                </li>
                <li>
                  <strong>Cloudflare</strong> - Infrastructure, CDN, and DDoS protection. Processes
                  network traffic and may collect IP addresses.
                </li>
                <li>
                  <strong>Resend</strong> - Email delivery service. Processes email addresses and
                  message content for transactional emails.
                </li>
                <li>
                  <strong>Twilio</strong> - SMS and communications. Processes phone numbers for
                  notifications and verification.
                </li>
                <li>
                  <strong>Anthropic (Claude)</strong> - AI-powered assistance. Processes your
                  prompts and content for AI features (Violet).
                </li>
              </ul>
              <p>We ensure these providers maintain appropriate security and privacy standards.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Storage and Security</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We store your data on secure servers provided by Cloudflare (D1 database and R2
                storage). We implement industry-standard security measures to protect your
                information, including encryption in transit and at rest.
              </p>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100%
                secure. While we strive to use commercially acceptable means to protect your
                information, we cannot guarantee its absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights (California CCPA)</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                If you are a California resident, you have the following rights under the California
                Consumer Privacy Act (CCPA):
              </p>
              <ul>
                <li>
                  <strong>Right to Know:</strong> You can request information about the personal
                  data we collect, use, and share.
                </li>
                <li>
                  <strong>Right to Delete:</strong> You can request deletion of your personal data
                  through the account deletion feature in your settings.
                </li>
                <li>
                  <strong>Right to Opt-Out:</strong> We do not sell your personal information. If
                  our practices change, we will update this policy and provide an opt-out mechanism.
                </li>
                <li>
                  <strong>Right to Non-Discrimination:</strong> We will not discriminate against you
                  for exercising your CCPA rights.
                </li>
              </ul>
              <p>
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@umbrella.app" className="text-primary hover:underline">
                  privacy@umbrella.app
                </a>{' '}
                or use the account deletion feature in your account settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We use cookies and similar tracking technologies to collect information about your
                browsing activities. This includes:
              </p>
              <ul>
                <li>Essential cookies for authentication and security (via Clerk)</li>
                <li>Cookies to remember your preferences and settings</li>
                <li>Analytics cookies to understand how you use our service</li>
              </ul>
              <p>
                You can control cookies through your browser settings. See our{' '}
                <a href="/legal/cookies" className="text-primary hover:underline">
                  Cookie Policy
                </a>{' '}
                for more details.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Our Service is not directed to children under the age of 13. We do not knowingly
                collect personal information from children under 13. If you become aware that a
                child has provided us with personal information, please contact us. If we discover
                that a child under 13 has provided us with personal information, we will delete such
                information from our systems.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the "Last
                updated" date. You are advised to review this Privacy Policy periodically for any
                changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <ul>
                <li>
                  Email:{' '}
                  <a href="mailto:privacy@umbrella.app" className="text-primary hover:underline">
                    privacy@umbrella.app
                  </a>
                </li>
                <li>
                  General inquiries:{' '}
                  <a href="mailto:support@umbrella.app" className="text-primary hover:underline">
                    support@umbrella.app
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="mt-8 rounded-lg bg-muted p-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This privacy policy is provided for MVP testing purposes.
              Before public launch, this content must be reviewed and approved by legal counsel to
              ensure compliance with all applicable privacy laws and regulations.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
