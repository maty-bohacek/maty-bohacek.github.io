import Link from 'next/link';
import Image from 'next/image';

export interface LogEntryData {
  id: string;
  date: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  image?: string;
  tags?: string[];
}

interface LogEntryProps {
  entry: LogEntryData;
}

export default function LogEntry({ entry }: LogEntryProps) {
  const { date, title, description, link, linkText, image, tags } = entry;

  // Parse date for display
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="group py-6 border-b border-neutral-200 last:border-0">
      {/* Date */}
      <time
        dateTime={date}
        className="text-sm font-medium text-neutral-500"
      >
        {formattedDate}
      </time>

      {/* Title */}
      <h3 className="text-neutral-900 mt-1">
        {link ? (
          <Link
            href={link}
            target={link.startsWith('http') ? '_blank' : undefined}
            rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="hover:text-primary-600 transition-colors"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>

      {/* Image */}
      {image && (
        <div className="mt-4 mb-4 overflow-hidden rounded-lg">
          <Image
            src={image}
            alt={title}
            width={600}
            height={300}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Link and Tags */}
      <div className="flex flex-wrap items-center gap-3 mt-2">
        {link && (
          <Link
            href={link}
            target={link.startsWith('http') ? '_blank' : undefined}
            rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-1 text-xs font-medium font-ui text-primary-600 hover:text-primary-700"
          >
            {linkText || 'Learn more'}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-ui px-2 py-0.5 bg-neutral-100 text-neutral-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
