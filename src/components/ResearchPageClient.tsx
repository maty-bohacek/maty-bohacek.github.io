'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PublicationCard from '@/components/PublicationCard';
import InterestFilter, { InterestOption } from '@/components/InterestFilter';
import { Publication } from '@/types';

interface ResearchPageClientProps {
  publicationsByYear: Record<number, Publication[]>;
  interestOptions: InterestOption[];
}

export default function ResearchPageClient({ publicationsByYear, interestOptions }: ResearchPageClientProps) {
  const searchParams = useSearchParams();
  const interestParam = searchParams.get('interest');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    () => (interestParam ? interestParam.split(',').filter(Boolean) : [])
  );

  // Keep the chips in step with links that arrive pre-filtered, e.g. from the
  // research interest blocks on the landing page.
  useEffect(() => {
    setSelectedInterests(interestParam ? interestParam.split(',').filter(Boolean) : []);
  }, [interestParam]);

  const allPublications = useMemo(() => {
    return Object.values(publicationsByYear).flat();
  }, [publicationsByYear]);

  const filteredPublications = useMemo(() => {
    return allPublications.filter((pub) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' ||
        pub.title.toLowerCase().includes(query) ||
        pub.authors.toLowerCase().includes(query) ||
        (pub.abstract?.toLowerCase().includes(query) ?? false) ||
        pub.venue.toLowerCase().includes(query) ||
        (pub.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false) ||
        (pub.keywords?.some(kw => kw.toLowerCase().includes(query)) ?? false);

      // Any of the selected interests, so picking two widens rather than
      // narrowing to the handful of papers that carry both.
      const matchesInterests = selectedInterests.length === 0 ||
        selectedInterests.some(id => pub.keywords?.includes(id));

      return matchesSearch && matchesInterests;
    });
  }, [allPublications, searchQuery, selectedInterests]);

  const filteredByYear = useMemo(() => {
    const byYear: Record<number, Publication[]> = {};
    filteredPublications.forEach((pub) => {
      if (!byYear[pub.year]) {
        byYear[pub.year] = [];
      }
      byYear[pub.year].push(pub);
    });
    return byYear;
  }, [filteredPublications]);

  const years = Object.keys(filteredByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedInterests([]);
  };

  const hasActiveFilters = searchQuery || selectedInterests.length > 0;
  const totalPublications = allPublications.length;

  return (
    <div className="site-container py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Research</h1>
        {totalPublications > 0 && (
          <p className="mt-2 text-sm font-ui text-neutral-400">
            {totalPublications} publication{totalPublications !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Search and Filters */}
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
            placeholder="Search publications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-ui border border-neutral-200 focus:border-neutral-400 outline-none transition-colors"
          />
        </div>

        <InterestFilter
          options={interestOptions}
          selected={selectedInterests}
          onToggle={toggleInterest}
        />

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-ui text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-xs font-ui text-neutral-400 mb-8">
        {filteredPublications.length} publication{filteredPublications.length !== 1 ? 's' : ''} found
      </p>

      {/* Publications by Year */}
      {years.length > 0 ? (
        years.map((year) => (
          <div key={year} className="mb-12 last:mb-0">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wide font-ui">{year}</h2>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredByYear[year].map((pub) => (
                <PublicationCard key={pub.id} publication={pub} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="py-16 text-center">
          <p className="text-neutral-500 text-sm">
            {hasActiveFilters
              ? 'No publications match your filters.'
              : 'No publications yet.'}
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
