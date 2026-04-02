import Link from 'next/link';

export interface UpcomingEvent {
  id: string;
  date: string;
  title: string;
  type: 'talk' | 'conference' | 'workshop' | 'event' | 'panel';
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
  panel: { bg: 'bg-swiss-pink/10', text: 'text-swiss-pink', label: 'Panel' },
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
      {/* Date & Location */}
      <div className="text-sm text-neutral-500">
        <time dateTime={date}>{formattedDate}</time>
        {location && <span> · {location}</span>}
      </div>

      {/* Label & Title */}
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-xs font-semibold font-ui px-2 py-0.5 ${style.bg} ${style.text}`}>
          {style.label}
        </span>
        <h4 className={`font-medium text-neutral-900 ${link ? 'group-hover:text-primary-600 transition-colors' : ''}`}>
          {title}
        </h4>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link
        href={link}
        target={link.startsWith('http') ? '_blank' : undefined}
        rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="block py-3 first:pt-0 border-b border-neutral-200 last:border-0"
      >
        {content}
      </Link>
    );
  }

  return <div className="py-3 first:pt-0 border-b border-neutral-200 last:border-0">{content}</div>;
}
