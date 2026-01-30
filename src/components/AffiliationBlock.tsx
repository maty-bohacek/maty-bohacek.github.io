import Link from 'next/link';
import Image from 'next/image';

interface AffiliationBlockProps {
  title: string;
  subtitle: string;
  href: string;
  icon?: string;
  color?: 'primary' | 'red' | 'orange' | 'blue' | 'pink' | 'teal';
}

const colorClasses = {
  primary: 'bg-primary-500',
  red: 'bg-swiss-red',
  orange: 'bg-swiss-orange',
  blue: 'bg-swiss-blue',
  pink: 'bg-swiss-pink',
  teal: 'bg-swiss-teal',
};

export default function AffiliationBlock({
  title,
  subtitle,
  href,
  icon,
  color = 'primary',
}: AffiliationBlockProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-neutral-50 hover:bg-neutral-100 transition-all duration-200 p-6 relative overflow-hidden"
    >
      {/* Accent bar */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${colorClasses[color]} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
      />

      <div className="flex items-start gap-4">
        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm">
            <Image
              src={icon}
              alt={title}
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
            {title}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
            {subtitle}
          </p>
        </div>

        {/* Arrow */}
        <svg
          className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-all flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
