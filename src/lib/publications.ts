import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Publication } from '@/types';

const publicationsPath = path.join(process.cwd(), 'data', 'publications.csv');

export function getPublications(): Publication[] {
  try {
    const fileContent = fs.readFileSync(publicationsPath, 'utf-8');
    const { data } = Papa.parse<Record<string, string>>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    return data.map((row) => ({
      id: row.id || row.title?.toLowerCase().replace(/\s+/g, '-') || '',
      title: row.title || '',
      authors: row.authors || '',
      venue: row.venue || '',
      year: parseInt(row.year || '0', 10),
      abstract: row.abstract || undefined,
      thumbnail: row.thumbnail || undefined,
      links: {
        paper: row.paper_url || undefined,
        project: row.project_url || undefined,
        code: row.code_url || undefined,
        data: row.data_url || undefined,
        video: row.video_url || undefined,
        slides: row.slides_url || undefined,
      },
      featured: row.featured === 'true' || row.featured === '1',
      tags: row.tags ? row.tags.split(';').map((t) => t.trim()) : [],
      keywords: row.keywords ? row.keywords.split(';').map((k) => k.trim()) : [],
    }));
  } catch (error) {
    console.error('Error loading publications:', error);
    return [];
  }
}

export function getFeaturedPublications(): Publication[] {
  return getPublications().filter((pub) => pub.featured);
}

export function getPublicationsByYear(): Record<number, Publication[]> {
  const publications = getPublications();
  const byYear: Record<number, Publication[]> = {};

  publications.forEach((pub) => {
    if (!byYear[pub.year]) {
      byYear[pub.year] = [];
    }
    byYear[pub.year].push(pub);
  });

  return byYear;
}

export function getPublicationById(id: string): Publication | undefined {
  return getPublications().find((pub) => pub.id === id);
}

export function getAllKeywords(): string[] {
  const publications = getPublications();
  const keywords = new Set<string>();
  publications.forEach((pub) => {
    pub.keywords?.forEach((kw) => keywords.add(kw));
  });
  return Array.from(keywords).sort();
}
