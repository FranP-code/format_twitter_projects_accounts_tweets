import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ProjectsTable } from './ProjectsTable';
import { ProjectCard } from './ProjectCard';
import { ThemeToggle } from './ThemeToggle';
import { LayoutGrid, Table } from 'lucide-react';
import { Button } from './ui/button';
import type { TwitterProject } from '@/lib/csv-loader';

interface ProjectsViewProps {
  projects: TwitterProject[];
}

export function ProjectsView({ projects }: ProjectsViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Separate projects with and without URLs
  const projectsWithUrls = projects.filter(p => p.project_url);
  const projectsWithoutUrls = projects.filter(p => !p.project_url);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Twitter Projects</h1>
            <p className="text-muted-foreground">
              Discover and explore amazing projects shared on Twitter
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none"
              >
                <Table className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-l-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-2xl font-bold text-foreground">{projects.length}</div>
            <div className="text-muted-foreground">Total Projects</div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="text-2xl font-bold text-green-600">{projectsWithUrls.length}</div>
            <div className="text-muted-foreground">With Project URLs</div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="text-2xl font-bold text-orange-600">{projectsWithoutUrls.length}</div>
            <div className="text-muted-foreground">Missing URLs</div>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="with-urls" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="with-urls">
              Projects with URLs ({projectsWithUrls.length})
            </TabsTrigger>
            <TabsTrigger value="without-urls">
              Missing URLs ({projectsWithoutUrls.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="with-urls" className="space-y-6">
            {viewMode === 'table' ? (
              <ProjectsTable
                projects={projectsWithUrls}
                title="Projects with URLs"
                showUrlColumn={true}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsWithUrls.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="without-urls" className="space-y-6">
            {viewMode === 'table' ? (
              <ProjectsTable
                projects={projectsWithoutUrls}
                title="Projects without URLs"
                showUrlColumn={false}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsWithoutUrls.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}