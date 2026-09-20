import fs from 'fs';
import path from 'path';
import { Affiliation, ResearchInterest, UpcomingEvent, SiteConfig } from '@/types';

const dataDirectory = path.join(process.cwd(), 'data');

export function getSiteConfig(): SiteConfig {
  try {
    const configPath = path.join(dataDirectory, 'config.json');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading site config:', error);
  }

  // Default config
  return {
    name: 'Maty Bohacek',
    title: 'Researcher at Stanford University',
    description: 'Working on AI, machine learning, and their societal impact.',
    bio: 'I am a researcher at Stanford University working on AI, machine learning, and their societal impact. My research focuses on understanding and improving AI systems for the benefit of humanity.',
    email: 'maty@stanford.edu',
    headshot: '/images/headshot.jpg',
    social: {
      twitter: 'https://twitter.com/matybohacek',
      github: 'https://github.com/maty-bohacek',
      linkedin: 'https://linkedin.com/in/matybohacek',
      scholar: 'https://scholar.google.com/citations?user=XXXXX',
    },
  };
}

export function getAffiliations(): Affiliation[] {
  try {
    const affiliationsPath = path.join(dataDirectory, 'affiliations.json');
    if (fs.existsSync(affiliationsPath)) {
      const content = fs.readFileSync(affiliationsPath, 'utf-8');
      const affiliations: Affiliation[] = JSON.parse(content);
      return affiliations.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    console.error('Error loading affiliations:', error);
  }

  return [];
}

export function getResearchInterests(): ResearchInterest[] {
  try {
    const interestsPath = path.join(dataDirectory, 'research-interests.json');
    if (fs.existsSync(interestsPath)) {
      const content = fs.readFileSync(interestsPath, 'utf-8');
      const interests: ResearchInterest[] = JSON.parse(content);
      return interests.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    console.error('Error loading research interests:', error);
  }

  return [];
}

// Filter chips on the research and blog pages; the stored title carries a
// newline before the ampersand, which has to collapse on a single-line chip.
export function getResearchInterestOptions() {
  return getResearchInterests().map((interest) => ({
    id: interest.id,
    label: interest.title.replace(/\s*\n\s*/g, ' '),
    icon: interest.icon,
  }));
}

export function getUpcomingEvents(): UpcomingEvent[] {
  try {
    const eventsPath = path.join(dataDirectory, 'upcoming.json');
    if (fs.existsSync(eventsPath)) {
      const content = fs.readFileSync(eventsPath, 'utf-8');
      const events: UpcomingEvent[] = JSON.parse(content);
      // Filter to only future events and sort by date
      const now = new Date();
      return events
        .filter((e) => new Date(e.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  } catch (error) {
    console.error('Error loading upcoming events:', error);
  }

  return [];
}
