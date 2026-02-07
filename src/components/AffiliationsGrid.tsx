'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import AffiliationModal from './AffiliationModal';

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
  const [openId, setOpenId] = useState<string | null>(null);

  const handleClose = useCallback(() => setOpenId(null), []);

  const openAffiliation = affiliations.find((a) => a.id === openId);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {affiliations.map((affiliation) => (
          <AffiliationBlockButton
            key={affiliation.id}
            title={affiliation.title}
            subtitle={affiliation.subtitle}
            icon={affiliation.icon}
            color={affiliation.color}
            onClick={() => setOpenId(affiliation.id)}
          />
        ))}
      </div>

      {openAffiliation && (
        <AffiliationModal
          isOpen={!!openId}
          onClose={handleClose}
          title={openAffiliation.title}
          subtitle={openAffiliation.subtitle}
          icon={openAffiliation.icon}
          color={openAffiliation.color}
          contentHtml={openAffiliation.contentHtml}
        />
      )}
    </>
  );
}

function AffiliationBlockButton({
  title,
  subtitle,
  icon,
  color = '#22c55e',
  onClick,
}: {
  title: string;
  subtitle: string;
  icon?: string;
  color?: string;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      className="group block w-full text-left bg-neutral-50 hover:bg-neutral-100 transition-all duration-200 p-6 relative overflow-hidden cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 w-full h-1 transition-transform duration-300"
        style={{
          backgroundColor: color,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
        }}
      />

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
            style={{ color: isHovered ? color : '#171717' }}
          >
            {title}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
            {subtitle}
          </p>
        </div>

        {/* Arrow */}
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
    </button>
  );
}
