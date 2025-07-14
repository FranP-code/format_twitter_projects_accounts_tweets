import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

export interface TwitterProject {
  id: string;
  created_at: string | null;
  project_description: string;
  project_url: string | null;
  original_tweet_url: string | null;
  media_type: string | null;
  media_thumbnail: string | null;
  media_original: string | null;
  author_screen_name: string;
  author_name: string;
  favorite_count: number;
  retweet_count: number;
  reply_count: number;
  views_count: number;
  category?: string;
}

export async function loadTwitterProjects(): Promise<TwitterProject[]> {
  try {
    const csvPath = path.join(process.cwd(), '..', 'unified_projects.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records = parse(csvContent, {
      columns: [
        'id',
        'created_at', 
        'project_description',
        'project_url',
        'media_type',
        'media_thumbnail',
        'media_original',
        'author_screen_name',
        'author_name',
        'favorite_count',
        'retweet_count',
        'reply_count',
        'views_count',
        'original_tweet_url'
      ],
      skip_empty_lines: true,
      cast: (value, context) => {
        // Convert numeric fields
        if (['favorite_count', 'retweet_count', 'reply_count', 'views_count'].includes(context.column as string)) {
          return parseInt(value) || 0;
        }
        // Handle null/empty values
        if (value === '' || value === 'null') {
          return null;
        }
        return value;
      }
    });

    return records.map((record: any) => ({
      ...record,
      category: record.category || 'Uncategorized'
    }));
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
}