import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { LogEntry } from '@/types';

const pressDirectory = path.join(process.cwd(), 'content', 'press');

// Press highlights reuse the same shape as journal/log entries: a dated item
// with a title, short description, and an outbound link (to an article,
// podcast, video, etc.). Files prefixed with "_" are treated as docs/examples
// and skipped.
export function getPressEntries(): LogEntry[] {
  try {
    if (!fs.existsSync(pressDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(pressDirectory);
    const entries = fileNames
      .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
      .map((fileName) => {
        const fullPath = path.join(pressDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          id: fileName.replace(/\.md$/, ''),
          date: data.date || new Date().toISOString(),
          title: data.title || '',
          description: content.trim() || data.description || '',
          link: data.link || undefined,
          linkText: data.linkText || undefined,
          image: data.image || undefined,
          images: data.images || undefined,
          tags: data.tags || [],
        } as LogEntry;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return entries;
  } catch (error) {
    console.error('Error loading press entries:', error);
    return [];
  }
}

export function getPressEntriesByYear(): Record<number, LogEntry[]> {
  const entries = getPressEntries();
  const byYear: Record<number, LogEntry[]> = {};

  entries.forEach((entry) => {
    const year = new Date(entry.date).getFullYear();
    if (!byYear[year]) {
      byYear[year] = [];
    }
    byYear[year].push(entry);
  });

  return byYear;
}

export function getRecentPressEntries(count: number = 5): LogEntry[] {
  return getPressEntries().slice(0, count);
}
