'use client';

import { useState, useMemo } from 'react';
import LogEntry from '@/components/LogEntry';
import { JOURNAL_CATEGORIES } from '@/lib/journal-categories';
import { LogEntry as LogEntryType } from '@/types';

interface JournalPageClientProps {
  entries: LogEntryType[];
}

export default function JournalPageClient({ entries }: JournalPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesSearch = query === '' ||
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query);

      const matchesCategory = !selectedCategory || entry.categories?.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [entries, searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  const entriesByYear = useMemo(() => {
    const grouped: Record<number, LogEntryType[]> = {};
    for (const entry of filteredEntries) {
      const year = new Date(entry.date).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(entry);
    }
    return grouped;
  }, [filteredEntries]);

  const years = useMemo(() =>
    Object.keys(entriesByYear).map(Number).sort((a, b) => b - a),
    [entriesByYear]
  );

  return (
    <div className="site-container py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold font-ui text-neutral-900 mb-2">Journal</h1>
      </div>

      {/* Filters */}
      <div className="mb-10 space-y-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search journal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-ui border border-neutral-200 focus:border-neutral-400 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {JOURNAL_CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === id ? null : id)}
              aria-pressed={selectedCategory === id}
              className={`px-3 py-1 text-xs font-ui transition-colors ${
                selectedCategory === id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-ui text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Entries */}
      {years.length > 0 ? (
        years.map((year) => (
          <div key={year} className="mb-12 last:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wide font-ui">{year}</h2>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
            <div>
              {entriesByYear[year].map((entry) => (
                <LogEntry key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="py-16 text-center">
          <p className="text-neutral-500 text-sm">
            {hasActiveFilters ? 'No journal entries match your filters.' : 'No journal entries yet.'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 text-sm text-neutral-500 underline underline-offset-2">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
