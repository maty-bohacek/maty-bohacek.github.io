'use client';

import { useState, useMemo } from 'react';
import PublicationCard from '@/components/PublicationCard';
import { Publication } from '@/types';

interface ResearchPageClientProps {
  publicationsByYear: Record<number, Publication[]>;
  allKeywords: string[];
}

export default function ResearchPageClient({ publicationsByYear, allKeywords }: ResearchPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

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

      const matchesKeywords = selectedKeywords.length === 0 ||
        selectedKeywords.every(kw => pub.keywords?.includes(kw));

      return matchesSearch && matchesKeywords;
    });
  }, [allPublications, searchQuery, selectedKeywords]);

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

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedKeywords([]);
  };

  const hasActiveFilters = searchQuery || selectedKeywords.length > 0;
  const totalPublications = allPublications.length;

  return (
    <div className="site-container py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Research</h1>
        <p className="text-base text-neutral-600 leading-relaxed">
          A complete list of my research publications, primarily in AI, computer vision, and media integrity.
        </p>
        {totalPublications > 0 && (
          <p className="mt-2 text-sm text-neutral-400">
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
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 focus:border-neutral-400 outline-none transition-colors"
          />
        </div>

        {allKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allKeywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => toggleKeyword(keyword)}
                className={`px-3 py-1 text-xs font-ui transition-colors ${
                  selectedKeywords.includes(keyword)
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {keyword}
              </button>
            ))}
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-xs text-neutral-400 mb-8">
        {filteredPublications.length} publication{filteredPublications.length !== 1 ? 's' : ''} found
      </p>

      {/* Publications by Year */}
      {years.length > 0 ? (
        years.map((year) => (
          <div key={year} className="mb-12 last:mb-0">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wide">{year}</h2>
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
