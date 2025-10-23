/**
 * Releases Page
 * List all releases with create and edit actions
 */

import { Link } from 'react-router-dom';
import { Plus, Loader2, GitBranch, Calendar, ExternalLink } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReleases } from '@/hooks/use-releases';

export function ReleasesPage() {
  const { releases, isLoading } = useReleases();

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Releases"
        description="Manage your application releases and deployments"
        action={
          <Button asChild>
            <Link to="/releases/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Release
            </Link>
          </Button>
        }
      />

      {releases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <GitBranch className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No releases yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first release to start deploying applications with Leger.
              Releases track your application configurations and git repositories.
            </p>
            <Button asChild>
              <Link to="/releases/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Release
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {releases.map((release) => (
            <Card key={release.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{release.name}</CardTitle>
                  <Badge variant="outline">v{release.version}</Badge>
                </div>
                {release.description && (
                  <CardDescription>{release.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <GitBranch className="h-4 w-4 mr-2" />
                    <span className="font-mono text-xs">{release.git_branch}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <a
                      href={release.git_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                    >
                      {new URL(release.git_url).pathname.slice(1)}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Updated {new Date(release.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={`/releases/${release.id}`}>Edit</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    Deploy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
