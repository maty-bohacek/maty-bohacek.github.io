'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AffiliationItem {
  id: string;
  title: string;
  subtitle: string;
  icon?: string;
  color?: string;
  contentHtml: string;
}

interface AffiliationsGridProps {
  affiliations: AffiliationItem[];
}

export default function AffiliationsGrid({ affiliations }: AffiliationsGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {affiliations.map((affiliation) => (
        <div key={affiliation.id} className="break-inside-avoid mb-4">
          <AffiliationCard
            affiliation={affiliation}
            isExpanded={expandedId === affiliation.id}
            onToggle={() => toggle(affiliation.id)}
          />
        </div>
      ))}
    </div>
  );
}

function AffiliationCard({
  affiliation,
  isExpanded,
  onToggle,
}: {
  affiliation: AffiliationItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { title, subtitle, icon, color = '#22c55e', contentHtml } = affiliation;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-neutral-50 hover:bg-neutral-100 transition-colors duration-200 relative overflow-hidden">
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 w-full h-1 transition-transform duration-300"
        style={{
          backgroundColor: color,
          transform: isHovered || isExpanded ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
        }}
      />

      {/* Clickable header */}
      <button
        type="button"
        className="w-full text-left p-6 cursor-pointer"
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-4">
          {icon && (
            <div className="flex-shrink-0 w-12 h-12 relative bg-white rounded-lg shadow-sm overflow-hidden">
              <Image
                src={icon}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold transition-colors truncate"
              style={{ color: isHovered || isExpanded ? color : '#171717' }}
            >
              {title}
            </h3>
            <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
              {subtitle}
            </p>
          </div>

          {/* Chevron that rotates when expanded */}
          <svg
            className="w-5 h-5 flex-shrink-0 transition-transform duration-200"
            style={{
              color: isHovered || isExpanded ? color : '#a3a3a3',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
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
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-neutral-200">
          <div
            className="pt-4 prose prose-sm prose-neutral max-w-none [&_a]:text-primary-600 [&_a]:underline [&_a:hover]:text-primary-700 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      )}
    </div>
  );
}
