'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface AffiliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon?: string;
  color?: string;
  contentHtml: string;
}

export default function AffiliationModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  color = '#22c55e',
  contentHtml,
}: AffiliationModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div className="relative bg-white max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
        {/* Color accent bar */}
        <div
          className="h-1 w-full"
          style={{ backgroundColor: color }}
        />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-neutral-200">
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
              <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
              <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-6 prose prose-sm prose-neutral max-w-none [&_a]:text-primary-600 [&_a]:underline [&_a:hover]:text-primary-700 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </div>
  );
}
