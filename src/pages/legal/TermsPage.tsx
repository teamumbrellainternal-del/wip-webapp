import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetaTags } from '@/components/MetaTags'

export default function TermsPage() {
  return (
    <AppLayout>
      <MetaTags
        title="Terms of Service"
        description="Read Umbrella's Terms of Service. Learn about user accounts, service description, acceptable use, and more."
        url="/terms"
      />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: November 17, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>
                By accessing and using Umbrella ("the Service"), you accept and agree to be bound by
                the terms and provisions of this agreement. If you do not agree to these Terms of
                Service, please do not use the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>
                To access certain features of the Service, you must register for an account. You are
                responsible for maintaining the confidentiality of your account credentials and for
                all activities that occur under your account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>
                  Maintain the security of your password and accept all risks of unauthorized access
                </li>
                <li>Notify us immediately if you discover or suspect any security breaches</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>
                Umbrella is a platform connecting independent artists with opportunities, providing
                tools for profile management, file storage, messaging, AI-powered assistance, and
                marketplace features for gigs and collaborations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Content Ownership and Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>
                You retain all rights to content you upload to the Service. By uploading content,
                you grant Umbrella a worldwide, non-exclusive, royalty-free license to use,
                reproduce, distribute, and display your content solely for the purpose of operating
                and providing the Service.
              </p>
              <p>
                You represent and warrant that you own or have the necessary rights to all content
                you upload and that such content does not violate any third-party rights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Spam or send unsolicited messages</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Collect user data without consent</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>
                We reserve the right to suspend or terminate your account at any time, with or
                without notice, for conduct that we believe violates these Terms of Service or is
                harmful to other users, us, or third parties, or for any other reason at our sole
                discretion.
              </p>
              <p>
                You may terminate your account at any time through the account settings page. Upon
                termination, your right to use the Service will immediately cease.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
                SECURE, OR ERROR-FREE. WE DO NOT WARRANT THE ACCURACY OR COMPLETENESS OF ANY CONTENT
                ON THE SERVICE.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, UMBRELLA SHALL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
                PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA,
                USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>
                These Terms of Service shall be governed by and construed in accordance with the
                laws of the United States, without regard to its conflict of law provisions. Any
                disputes arising from these terms shall be resolved in the courts of the United
                States.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>
                We reserve the right to modify these Terms of Service at any time. We will notify
                users of any material changes by posting a notice on the Service or by email. Your
                continued use of the Service after such modifications constitutes your acceptance of
                the updated terms.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 rounded-lg bg-muted p-6">
            <p className="text-sm text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@umbrellalive.com" className="text-primary hover:underline">
                legal@umbrellalive.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
