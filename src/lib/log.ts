import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { LogEntry } from '@/types';

const logDirectory = path.join(process.cwd(), 'content', 'log');

export function getLogEntries(): LogEntry[] {
  try {
    if (!fs.existsSync(logDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(logDirectory);
    const entries = fileNames
      .filter((name) => name.endsWith('.md'))
      .map((fileName) => {
        const fullPath = path.join(logDirectory, fileName);
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
    console.error('Error loading log entries:', error);
    return [];
  }
}

export function getLogEntriesByYear(): Record<number, LogEntry[]> {
  const entries = getLogEntries();
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

export function getRecentLogEntries(count: number = 5): LogEntry[] {
  return getLogEntries().slice(0, count);
}
