import { useState, useEffect, useCallback } from 'react';
import { ProjectsTable } from './ProjectsTable';
import { ProjectCard } from './ProjectCard';
import { ThemeToggle } from './ThemeToggle';
import { LayoutGrid, Table, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import type { TwitterProject } from '@/lib/csv-loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getSeenProjects, clearAllSeenProjects } from '@/lib/seen-projects';

interface ProjectsViewProps {
  projects: TwitterProject[];
}

export function ProjectsView({ projects }: ProjectsViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [seenProjectIds, setSeenProjectIds] = useState<Set<string>>(new Set());

  // Update seen projects state
  const updateSeenProjects = useCallback(() => {
    setSeenProjectIds(getSeenProjects());
  }, []);

  useEffect(() => {
    updateSeenProjects();
  }, [updateSeenProjects]);

  // Separate projects by URL and seen status
  const unseenProjects = projects.filter(p => !seenProjectIds.has(p.id));
  const seenProjects = projects.filter(p => seenProjectIds.has(p.id));
  
  const unseenWithUrls = unseenProjects.filter(p => p.project_url);
  const unseenWithoutUrls = unseenProjects.filter(p => !p.project_url);
  const seenWithUrls = seenProjects.filter(p => p.project_url);
  const seenWithoutUrls = seenProjects.filter(p => !p.project_url);

  const handleClearSeenProjects = () => {
    clearAllSeenProjects();
    updateSeenProjects();
  };

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
            {seenProjects.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSeenProjects}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Seen ({seenProjects.length})
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-2xl font-bold text-foreground">{projects.length}</div>
            <div className="text-muted-foreground">Total Projects</div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="text-2xl font-bold text-blue-600">{unseenProjects.length}</div>
            <div className="text-muted-foreground">Unseen Projects</div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="text-2xl font-bold text-green-600">{seenProjects.length}</div>
            <div className="text-muted-foreground">Seen Projects</div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="text-2xl font-bold text-purple-600">{projects.filter(p => p.project_url).length}</div>
            <div className="text-muted-foreground">With URLs</div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="text-2xl font-bold text-orange-600">{projects.filter(p => !p.project_url).length}</div>
            <div className="text-muted-foreground">No URLs</div>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="with-urls" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="with-urls">
              Unseen w/ URLs ({unseenWithUrls.length})
            </TabsTrigger>
            <TabsTrigger value="without-urls">
              Unseen w/o URLs ({unseenWithoutUrls.length})
            </TabsTrigger>
            <TabsTrigger value="seen-with-urls">
              Seen w/ URLs ({seenWithUrls.length})
            </TabsTrigger>
            <TabsTrigger value="seen-without-urls">
              Seen w/o URLs ({seenWithoutUrls.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="with-urls" className="space-y-6">
            {viewMode === 'table' ? (
              <ProjectsTable
                projects={unseenWithUrls}
                title="Unseen Projects with URLs"
                showUrlColumn={true}
                onSeenStatusChange={updateSeenProjects}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unseenWithUrls.map((project) => (
                  <ProjectCard key={project.id} project={project} onSeenStatusChange={updateSeenProjects} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="without-urls" className="space-y-6">
            {viewMode === 'table' ? (
              <ProjectsTable
                projects={unseenWithoutUrls}
                title="Unseen Projects without URLs"
                showUrlColumn={false}
                onSeenStatusChange={updateSeenProjects}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unseenWithoutUrls.map((project) => (
                  <ProjectCard key={project.id} project={project} onSeenStatusChange={updateSeenProjects} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="seen-with-urls" className="space-y-6">
            {viewMode === 'table' ? (
              <ProjectsTable
                projects={seenWithUrls}
                title="Seen Projects with URLs"
                showUrlColumn={true}
                onSeenStatusChange={updateSeenProjects}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {seenWithUrls.map((project) => (
                  <ProjectCard key={project.id} project={project} onSeenStatusChange={updateSeenProjects} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="seen-without-urls" className="space-y-6">
            {viewMode === 'table' ? (
              <ProjectsTable
                projects={seenWithoutUrls}
                title="Seen Projects without URLs"
                showUrlColumn={false}
                onSeenStatusChange={updateSeenProjects}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {seenWithoutUrls.map((project) => (
                  <ProjectCard key={project.id} project={project} onSeenStatusChange={updateSeenProjects} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}