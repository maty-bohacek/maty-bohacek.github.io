import fs from 'fs';
import path from 'path';
import { getLogEntries } from '@/lib/log';
import { SpeakingAudience, SpeakingEngagement, SpeakingPageData } from '@/types';

// The /speaking page is deliberately left out of the navigation: it is a page
// to send to event organizers, not one visitors browse to.
//
// Its past engagements are the journal entries (content/log/) with a
// `speaking:` block in their frontmatter; see SpeakingDetails in src/types.
// Who an engagement was for comes from the entry's "industry" or "academic"
// category. Everything else on the page lives in data/speaking.json.

const AUDIENCES: SpeakingAudience[] = ['industry', 'academic'];

export function getSpeakingEngagements(): SpeakingEngagement[] {
  return getLogEntries()
    .filter((entry) => entry.speaking)
    .map((entry) => ({
      ...entry.speaking!,
      id: entry.id,
      date: entry.date,
      link: entry.link,
      image: entry.images?.[0] || entry.image,
      audiences: AUDIENCES.filter((a) => entry.categories?.includes(a)),
    }));
}

export function getSpeakingPageData(): SpeakingPageData {
  const filePath = path.join(process.cwd(), 'data', 'speaking.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// "Boston, MA" and "Washington, DC" are in the US; "Prague, Czechia" is in
// Czechia. Virtual and unknown locations are not counted.
export function countCountries(engagements: SpeakingEngagement[]): number {
  const countries = new Set<string>();
  for (const { location } of engagements) {
    if (!location || location === 'Virtual') continue;
    const last = location.split(',').pop()!.trim();
    countries.add(/^[A-Z]{2}$/.test(last) && last !== 'UK' ? 'US' : last);
  }
  return countries.size;
}
