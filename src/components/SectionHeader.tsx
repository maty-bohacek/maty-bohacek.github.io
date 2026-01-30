import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
  accent?: boolean;
}

export default function SectionHeader({
  title,
  subtitle,
  viewAllLink,
  viewAllText = 'View all',
  accent = false,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        <h2 className={`text-display-sm ${accent ? 'text-primary-600' : 'text-neutral-900'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-neutral-500 mt-2 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors group"
        >
          {viewAllText}
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
