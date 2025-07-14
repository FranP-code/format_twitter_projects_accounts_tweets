/**
 * Utility functions for tracking seen projects using localStorage
 */

const SEEN_PROJECTS_KEY = 'twitter-projects-seen';

export function getSeenProjects(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const stored = localStorage.getItem(SEEN_PROJECTS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function markProjectAsSeen(projectId: string): void {
  if (typeof window === 'undefined') return;
  
  const seenProjects = getSeenProjects();
  seenProjects.add(projectId);
  localStorage.setItem(SEEN_PROJECTS_KEY, JSON.stringify([...seenProjects]));
}

export function markProjectAsUnseen(projectId: string): void {
  if (typeof window === 'undefined') return;
  
  const seenProjects = getSeenProjects();
  seenProjects.delete(projectId);
  localStorage.setItem(SEEN_PROJECTS_KEY, JSON.stringify([...seenProjects]));
}

export function isProjectSeen(projectId: string): boolean {
  if (typeof window === 'undefined') return false;
  return getSeenProjects().has(projectId);
}

export function clearAllSeenProjects(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SEEN_PROJECTS_KEY);
}