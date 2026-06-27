'use client';

/**
 * Small pencil button used to start inline editing of a field. It's meant to sit
 * directly to the right of a field's label (not next to the content), so the
 * affordance reads as "edit this field".
 */
export default function EditButton({
  onClick,
  label,
  className = '',
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Edit ${label}`}
      aria-label={`Edit ${label}`}
      className={`text-neutral-400 transition-colors hover:text-primary-600 ${className}`}
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>
  );
}
