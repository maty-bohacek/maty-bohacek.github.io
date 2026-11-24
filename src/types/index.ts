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
}

// Content of the unlinked /speaking page (data/speaking.json).
export interface SpeakingPhoto {
  image: string;
  event: string;
  location: string;
}

// A logo in the "In the media" or "Past engagements" strips.
export interface SpeakingLogo {
  name: string;
  logo: string;
  height?: number;  // px; evens out logos of different shapes (default 22)
  dark?: boolean;   // render as a solid dark shape, for pale logos that wash out in grayscale
}

export interface SpeakingPageData {
  intro: string;
  photos: SpeakingPhoto[];
  media: SpeakingLogo[];
  engagements: SpeakingLogo[];
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
