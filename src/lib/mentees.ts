import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getPublications } from './publications';
import { Publication } from '@/types';

const menteesDirectory = path.join(process.cwd(), 'content', 'mentees');
const mentoredPubsPath = path.join(process.cwd(), 'data', 'mentored-publications.json');

// A parsed piece of a mentee blurb: either plain text or a citation that
// points at an entry in the numbered "Mentored Publications" list.
export type BlurbSegment =
  | { type: 'text'; value: string }
  | { type: 'cite'; pubId: string; number: number | null };

export interface Mentee {
  id: string;
  name: string;
  website?: string;
  photo?: string;
  status: 'active' | 'past';
  order: number;
  blurb: BlurbSegment[];
}

export interface MentoredPublication {
  number: number;
  publication: Publication;
}

// The ordered, numbered list of mentored/led publications shown at the bottom
// of the page. Order is defined in data/mentored-publications.json; metadata is
// pulled from the shared publications database (data/publications.csv).
export function getMentoredPublications(): MentoredPublication[] {
  try {
    const raw = JSON.parse(fs.readFileSync(mentoredPubsPath, 'utf8')) as { publications?: string[] };
    const ids = raw.publications || [];
    const byId = new Map(getPublications().map((p) => [p.id, p]));

    return ids
      .map((id, index) => {
        const publication = byId.get(id);
        if (!publication) {
          console.warn(`Mentored publication id not found in publications.csv: ${id}`);
          return null;
        }
        return { number: index + 1, publication };
      })
      .filter((entry): entry is MentoredPublication => entry !== null);
  } catch (error) {
    console.error('Error loading mentored publications:', error);
    return [];
  }
}

// Splits a blurb into text + citation segments. Citations are written as
// [[publication-id]] and rendered as the matching number from the mentored
// publications list.
function parseBlurb(body: string, numberById: Map<string, number>): BlurbSegment[] {
  const text = body.trim();
  const segments: BlurbSegment[] = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const pubId = match[1].trim();
    segments.push({ type: 'cite', pubId, number: numberById.get(pubId) ?? null });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

export function getMentees(): Mentee[] {
  try {
    if (!fs.existsSync(menteesDirectory)) {
      return [];
    }

    const numberById = new Map(
      getMentoredPublications().map((entry) => [entry.publication.id, entry.number])
    );

    return fs
      .readdirSync(menteesDirectory)
      .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
      .map((fileName) => {
        const fullPath = path.join(menteesDirectory, fileName);
        const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'));

        return {
          id: fileName.replace(/\.md$/, ''),
          name: data.name || '',
          website: data.website || undefined,
          photo: data.photo || undefined,
          status: data.status === 'past' ? 'past' : 'active',
          order: typeof data.order === 'number' ? data.order : 999,
          blurb: parseBlurb(content, numberById),
        } as Mentee;
      })
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error loading mentees:', error);
    return [];
  }
}

export function getActiveMentees(): Mentee[] {
  return getMentees().filter((mentee) => mentee.status === 'active');
}

export function getPastMentees(): Mentee[] {
  return getMentees().filter((mentee) => mentee.status === 'past');
}
