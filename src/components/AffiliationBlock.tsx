'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface AffiliationBlockProps {
  title: string;
  subtitle: string;
  href: string;
  icon?: string;
  color?: string; // Hex color code
}

export default function AffiliationBlock({
  title,
  subtitle,
  href,
  icon,
  color = '#22c55e',
}: AffiliationBlockProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine if link is external
  const isExternal = href.startsWith('http') || href.startsWith('//');

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group block bg-neutral-50 hover:bg-neutral-100 transition-all duration-200 p-6 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Accent bar - uses custom color */}
      <div
        className="absolute top-0 left-0 w-full h-1 transition-transform duration-300"
        style={{
          backgroundColor: color,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
        }}
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
          <h3
            className="font-semibold transition-colors truncate"
            style={{ color: isHovered ? color : '#171717' }}
          >
            {title}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
            {subtitle}
          </p>
        </div>

        {/* Arrow - uses custom color on hover */}
        <svg
          className="w-5 h-5 transform transition-all flex-shrink-0"
          style={{
            color: isHovered ? color : '#a3a3a3',
            transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
          }}
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
