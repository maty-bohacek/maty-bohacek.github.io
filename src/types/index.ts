export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  abstract?: string;
  thumbnail?: string;
  links: {
    paper?: string;
    project?: string;
    code?: string;
    data?: string;
    video?: string;
    slides?: string;
  };
  featured?: boolean;
  tags?: string[];
  keywords?: string[];
}

export interface LogEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  image?: string;
  images?: string[];
  logo?: string;
  source?: string;
  tags?: string[];
  categories?: string[];
  speaking?: SpeakingDetails;
}

// Set on journal entries that were talks, panels, keynotes, and the like.
// These entries make up the past engagements on the (unlinked) /speaking page.
export interface SpeakingDetails {
  event: string;      // Shown in bold, e.g. "MIT" or "SXSW"
  detail?: string;    // Lab, seminar series, or workshop, e.g. "Antonio Torralba's lab"
  talk?: string;      // Talk or panel title
  format: string;     // e.g. "Keynote", "Talk", "Panel", "Paper"
  location?: string;  // "City, ST" in the US, "City, Country" elsewhere, or "Virtual"
  topic?: string;     // id of a talk in data/speaking.json
}

export type SpeakingAudience = 'industry' | 'academic';

export interface SpeakingEngagement extends SpeakingDetails {
  id: string;
  date: string;
  link?: string;
  image?: string;
  audiences: SpeakingAudience[];
}

export interface SpeakingTopic {
  id: string;
  title: string;
  subtitle?: string;
  summary: string;
  audiences: SpeakingAudience[];
}

export interface SpeakingAudienceBlurb {
  id: SpeakingAudience;
  label: string;
  summary: string;
  formats: string;
  highlights: string[];
}

export interface SpeakingPageData {
  intro: string;
  audiences: SpeakingAudienceBlurb[];
  topics: SpeakingTopic[];
  gallery: string[];  // journal entry ids; the first photo of each is shown
  media: string[];
  bio: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: 'Research' | 'AI & Democracy' | 'Books' | 'Movies' | 'Miscellaneous';
  tags: string[];
  interests?: string[];
  coverImage?: string;
  coverCaption?: string;
  readingTime?: string;
}

export interface UpcomingEvent {
  id: string;
  date: string;
  title: string;
  type: 'talk' | 'conference' | 'workshop' | 'event' | 'panel' | 'poster';
  location?: string;
  link?: string;
}

export interface Affiliation {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon?: string;
  color?: string; // Hex color code
  order: number;
}

export interface ResearchInterest {
  id: string;
  title: string;
  shortTitle?: string;
  summary: string;
  body: string;
  icon?: string;
  order: number;
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  bio: string;
  email: string;
  headshot: string;
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    scholar?: string;
  };
}
