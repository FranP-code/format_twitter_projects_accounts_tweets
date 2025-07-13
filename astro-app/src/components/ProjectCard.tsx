import { ExternalLink, Heart, MessageCircle, Repeat2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { TwitterProject } from '@/lib/csv-loader';

interface ProjectCardProps {
  project: TwitterProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formattedDate = formatDistanceToNow(new Date(project.created_at), { addSuffix: true });

  return (
    <div className="bg-card rounded-lg border p-6 space-y-4 hover:shadow-lg transition-shadow">
      {/* Author Info */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
          {project.author_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-foreground">{project.author_name}</p>
          <p className="text-sm text-muted-foreground">@{project.author_screen_name}</p>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {formattedDate}
        </div>
      </div>

      {/* Project Media */}
      {project.media_thumbnail && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={project.media_thumbnail}
            alt="Project preview"
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Project Description */}
      <div>
        <p className="text-foreground leading-relaxed">{project.project_description}</p>
      </div>

      {/* Project URL */}
      {project.project_url && (
        <div>
          <a
            href={project.project_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">View Project</span>
          </a>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="flex items-center space-x-6 pt-2 border-t">
        <div className="flex items-center space-x-1 text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span className="text-sm">{project.favorite_count.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1 text-muted-foreground">
          <Repeat2 className="w-4 h-4" />
          <span className="text-sm">{project.retweet_count.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1 text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{project.reply_count.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1 text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{project.views_count.toLocaleString()}</span>
        </div>
      </div>

      {/* Category */}
      {project.category && (
        <div className="flex justify-end">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
            {project.category}
          </span>
        </div>
      )}
    </div>
  );
}