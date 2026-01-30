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
}

export interface LogEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  image?: string;
  tags?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: 'Research' | 'AI & Democracy' | 'Books' | 'Movies' | 'Miscellaneous';
  tags: string[];
  coverImage?: string;
  readingTime?: string;
}

export interface UpcomingEvent {
  id: string;
  date: string;
  title: string;
  type: 'talk' | 'conference' | 'workshop' | 'event';
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
