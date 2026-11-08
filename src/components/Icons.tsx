// Small line icons for text links, drawn to match the chevron next to
// "Learn more" in LogEntry: 24px grid, 2px rounded strokes, currentColor.

interface IconProps {
  className?: string;
}

/** A diagonal arrow (↗) for links that lead on to another page. */
export function ArrowUpRightIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

/** A left chevron for "back" links, the mirror of the "Learn more" chevron. */
export function ChevronLeftIcon({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
