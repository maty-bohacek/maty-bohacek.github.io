import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const affiliationsDirectory = path.join(process.cwd(), 'content', 'affiliations');

export interface AffiliationContent {
  id: string;
  title: string;
  subtitle: string;
  icon?: string;
  color?: string;
  order: number;
  content: string;
}

export function getAffiliationContents(): AffiliationContent[] {
  try {
    if (!fs.existsSync(affiliationsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(affiliationsDirectory);
    const affiliations = fileNames
      .filter((name) => name.endsWith('.md'))
      .map((fileName) => {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(affiliationsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          id,
          title: data.title || id,
          subtitle: data.subtitle || '',
          icon: data.icon || undefined,
          color: data.color || undefined,
          order: data.order || 999,
          content: content.trim(),
        } as AffiliationContent;
      })
      .sort((a, b) => a.order - b.order);

    return affiliations;
  } catch (error) {
    console.error('Error loading affiliation contents:', error);
    return [];
  }
}
