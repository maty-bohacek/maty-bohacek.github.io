import Link from 'next/link';

export interface UpcomingEvent {
  id: string;
  date: string;
  title: string;
  type: 'talk' | 'conference' | 'workshop' | 'event';
  location?: string;
  link?: string;
}

interface UpcomingItemProps {
  event: UpcomingEvent;
}

const typeStyles = {
  talk: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Talk' },
  conference: { bg: 'bg-swiss-blue/10', text: 'text-swiss-blue', label: 'Conference' },
  workshop: { bg: 'bg-swiss-orange/10', text: 'text-swiss-orange', label: 'Workshop' },
  event: { bg: 'bg-swiss-pink/10', text: 'text-swiss-pink', label: 'Event' },
};

export default function UpcomingItem({ event }: UpcomingItemProps) {
  const { date, title, type, location, link } = event;
  const style = typeStyles[type];

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const content = (
    <div className="group">
      {/* Date */}
      <time
        dateTime={date}
        className="text-sm text-neutral-500"
      >
        {formattedDate}
      </time>

      {/* Content */}
      <div className="mt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold font-ui px-2 py-0.5 ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>
        <h4 className={`font-medium text-neutral-900 ${link ? 'group-hover:text-primary-600 transition-colors' : ''}`}>
          {title}
        </h4>
        {location && (
          <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </p>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link
        href={link}
        target={link.startsWith('http') ? '_blank' : undefined}
        rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="block py-3 first:pt-0 border-b border-neutral-100 last:border-0"
      >
        {content}
      </Link>
    );
  }

  return <div className="py-3 first:pt-0 border-b border-neutral-100 last:border-0">{content}</div>;
}
