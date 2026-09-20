'use client';

import Image from 'next/image';

export interface InterestOption {
  id: string;
  label: string;
  icon?: string;
}

interface InterestFilterProps {
  options: InterestOption[];
  selected: string[];
  onToggle: (id: string) => void;
}

export default function InterestFilter({ options, selected, onToggle }: InterestFilterProps) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            aria-pressed={isSelected}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-ui transition-colors ${
              isSelected
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {option.icon && (
              <Image
                src={option.icon}
                alt=""
                width={20}
                height={20}
                /* The icons are black glyphs, so invert them on the dark selected chip */
                className={`w-5 h-5 object-contain ${isSelected ? 'invert' : ''}`}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
