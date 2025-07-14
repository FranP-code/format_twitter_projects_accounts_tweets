import { ExternalLink, Heart, MessageCircle, Repeat2, Eye, Twitter, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import type { TwitterProject } from '@/lib/csv-loader';
import { markProjectAsSeen, markProjectAsUnseen, isProjectSeen } from '@/lib/seen-projects';
import { Button } from './ui/button';

interface ProjectCardProps {
  project: TwitterProject;
  onSeenStatusChange?: () => void;
}

export function ProjectCard({ project, onSeenStatusChange }: ProjectCardProps) {
  const formattedDate = project.created_at && !isNaN(new Date(project.created_at).getTime())
    ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
    : 'N/A';
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    setSeen(isProjectSeen(project.id));
  }, [project.id]);

  const toggleSeen = () => {
    if (seen) {
      markProjectAsUnseen(project.id);
      setSeen(false);
    } else {
      markProjectAsSeen(project.id);
      setSeen(true);
    }
    onSeenStatusChange?.();
  };

  return (
    <div className={`bg-card rounded-lg border p-6 space-y-4 hover:shadow-lg transition-all ${seen ? 'opacity-75 bg-muted/50' : ''}`}>
      {/* Author Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
          {project.author_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-foreground">{project.author_name}</p>
          <p className="text-sm text-muted-foreground">@{project.author_screen_name}</p>
        </div>
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
        <div className="flex items-start justify-between gap-4">
          <p className="text-foreground leading-relaxed flex-1">{project.project_description}</p>
          {/* Seen Checkbox - moved here */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <input
              type="checkbox"
              id={`seen-${project.id}`}
              className="w-4 h-4 rounded border-border bg-background"
              checked={seen}
              onChange={toggleSeen}
            />
            <label 
              htmlFor={`seen-${project.id}`}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Seen
            </label>
          </div>
        </div>
      </div>

      {/* Project Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            {/* Project URL */}
            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">View Project</span>
              </a>
            )}
            
            {/* Tweet URL */}
            {project.original_tweet_url && (
              <a
                href={project.original_tweet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                <span className="text-sm font-medium">View Tweet</span>
              </a>
            )}
          </div>
        
        </div>
        
      </div>

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