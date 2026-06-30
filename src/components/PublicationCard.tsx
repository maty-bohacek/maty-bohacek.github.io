import Link from 'next/link';
import Image from 'next/image';

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

interface PublicationCardProps {
  publication: Publication;
  compact?: boolean;
}

export default function PublicationCard({ publication, compact = false }: PublicationCardProps) {
  const { title, authors, venue, year, thumbnail, links, abstract } = publication;

  return (
    <article className={`group bg-white border border-neutral-200 hover:border-primary-300 transition-all duration-200 ${compact ? '' : 'hover:shadow-md'}`}>
      <div className={`flex ${compact ? 'flex-row gap-4 p-4' : 'flex-col'}`}>
        {/* Thumbnail */}
        {thumbnail && (
          <div className={`${compact ? 'flex-shrink-0 w-32' : 'aspect-video'} bg-neutral-100 overflow-hidden`}>
            <Image
              src={thumbnail}
              alt={title}
              width={compact ? 128 : 400}
              height={compact ? 80 : 225}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className={compact ? 'flex-1 min-w-0' : 'p-6'}>
          {/* Year badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold font-ui bg-primary-100 text-primary-700 px-2 py-0.5">
              {year}
            </span>
            <span className="text-xs font-ui text-neutral-500 truncate">{venue}</span>
          </div>

          {/* Title */}
          <h3 className={`font-bold text-neutral-900 group-hover:text-primary-600 transition-colors ${compact ? 'text-sm line-clamp-2' : 'text-base mb-2'}`}>
            {links.paper ? (
              <Link href={links.paper} target="_blank" rel="noopener noreferrer">
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>

          {/* Authors */}
          <p className={`text-neutral-600 ${compact ? 'text-xs line-clamp-1' : 'text-sm mb-3 line-clamp-2'}`}>
            {authors}
          </p>

          {/* Abstract (only for non-compact) */}
          {!compact && abstract && (
            <p className="text-sm text-neutral-500 mb-4 line-clamp-3">
              {abstract}
            </p>
          )}

          {/* Links */}
          <div className={`flex flex-wrap gap-2 ${compact ? 'mt-2' : ''}`}>
            {links.paper && (
              <LinkButton href={links.paper} icon="paper">
                Paper
              </LinkButton>
            )}
            {links.project && (
              <LinkButton href={links.project} icon="project">
                Project
              </LinkButton>
            )}
            {links.code && (
              <LinkButton href={links.code} icon="code">
                Code
              </LinkButton>
            )}
            {links.data && (
              <LinkButton href={links.data} icon="data">
                Data
              </LinkButton>
            )}
            {links.video && (
              <LinkButton href={links.video} icon="video">
                Video
              </LinkButton>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function LinkButton({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  const icons: Record<string, React.ReactNode> = {
    paper: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    project: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    code: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    data: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
    video: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium font-ui text-neutral-600 hover:text-primary-600 bg-neutral-100 hover:bg-primary-50 px-2.5 py-1.5 transition-colors"
    >
      {icons[icon]}
      {children}
    </Link>
  );
}
