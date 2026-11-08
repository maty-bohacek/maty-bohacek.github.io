import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { LogEntry } from '@/types';
import { JOURNAL_CATEGORY_IDS } from '@/lib/journal-categories';

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
        const id = fileName.replace(/\.md$/, '');
        const categories: string[] = data.categories || [];

        // Catch typos at build time: an entry without a known category never
        // shows up under any journal filter.
        if (categories.length === 0) {
          console.warn(`Journal entry ${id} has no categories`);
        }
        categories
          .filter((c) => !JOURNAL_CATEGORY_IDS.includes(c))
          .forEach((c) => console.warn(`Journal entry ${id} has an unknown category: ${c}`));

        return {
          id,
          date: data.date || new Date().toISOString(),
          title: data.title || '',
          description: content.trim() || data.description || '',
          link: data.link || undefined,
          linkText: data.linkText || undefined,
          image: data.image || undefined,
          images: data.images || undefined,
          logo: data.logo || undefined,
          categories,
        } as LogEntry;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return entries;
  } catch (error) {
    console.error('Error loading log entries:', error);
    return [];
  }
}

export function getRecentLogEntries(count: number = 5): LogEntry[] {
  return getLogEntries().slice(0, count);
}
