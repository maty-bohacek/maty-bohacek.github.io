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
  images?: string[];
  logo?: string;
  tags?: string[];
}

interface LogEntryProps {
  entry: LogEntryData;
  showDescription?: boolean;
  showImages?: boolean;
  compact?: boolean;
}

export default function LogEntry({ entry, showDescription = true, showImages = true, compact = false }: LogEntryProps) {
  const { date, title, description, link, linkText, image, images, logo } = entry;

  // Parse date for display
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const content = (
    <>
      {/* Date */}
      <time
        dateTime={date}
        className="text-sm font-medium text-neutral-500"
      >
        {formattedDate}
      </time>

      {/* Title */}
      <h3 className={`${compact ? 'font-medium' : 'font-bold'} text-neutral-900 mt-1`}>
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

      {/* Description */}
      {showDescription && description && (
        <p className="text-sm text-neutral-600 mt-1">{description}</p>
      )}

      {/* Images */}
      {showImages && ((images && images.length > 0) || image) ? (
        <div className="mt-4 mb-4 grid grid-cols-2 gap-3">
          {(images || (image ? [image] : [])).map((src, index) => (
            <div key={index} className="overflow-hidden rounded-lg h-48">
              <Image
                src={src}
                alt={images && images.length > 1 ? `${title} — ${index + 1}` : title}
                width={400}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      {/* Link */}
      {!compact && link && (
        <div className="mt-2">
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
        </div>
      )}
    </>
  );

  return (
    <article className={`group ${compact ? 'py-3' : 'py-6'} first:pt-0 border-b border-neutral-200 last:border-0`}>
      {logo ? (
        <div className="flex gap-3 sm:gap-4">
          {/* Outlet logo */}
          <span className="flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md overflow-hidden bg-white ring-1 ring-neutral-200/80 shadow-sm">
            <Image
              src={logo}
              alt=""
              width={40}
              height={40}
              className="w-full h-full object-contain p-1"
            />
          </span>
          <div className="min-w-0 flex-1">{content}</div>
        </div>
      ) : (
        content
      )}
    </article>
  );
}
