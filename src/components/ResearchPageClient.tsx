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
      // Search filter - searches title, authors, abstract, venue, tags, and keywords
      const query = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' ||
        pub.title.toLowerCase().includes(query) ||
        pub.authors.toLowerCase().includes(query) ||
        (pub.abstract?.toLowerCase().includes(query) ?? false) ||
        pub.venue.toLowerCase().includes(query) ||
        (pub.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false) ||
        (pub.keywords?.some(kw => kw.toLowerCase().includes(query)) ?? false);

      // Keywords filter
      const matchesKeywords = selectedKeywords.length === 0 ||
        selectedKeywords.every(kw => pub.keywords?.includes(kw));

      return matchesSearch && matchesKeywords;
    });
  }, [allPublications, searchQuery, selectedKeywords]);

  // Group filtered publications by year
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
    <>
      {/* Hero */}
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <h1 className="text-display-lg text-neutral-900 mb-4">Research</h1>
          <p className="text-base lg:text-lg text-neutral-600 max-w-3xl leading-relaxed">
            A complete list of my research publications, primarily in AI, computer vision, and media integrity.
          </p>
          {totalPublications > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium text-neutral-500">
                {totalPublications} publication{totalPublications !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Filters & Publications */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          {/* Search and Filters */}
          <div className="mb-12">
            {/* Search */}
            <div className="relative max-w-md mb-6">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
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
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-colors"
              />
            </div>

            {/* Keywords Filter */}
            {allKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm font-medium text-neutral-500 mr-2 py-2">Keywords:</span>
                {allKeywords.map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => toggleKeyword(keyword)}
                    className={`px-4 py-2 text-sm font-medium font-ui transition-colors ${
                      selectedKeywords.includes(keyword)
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-neutral-500">
              {filteredPublications.length} publication{filteredPublications.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Publications by Year */}
          {years.length > 0 ? (
            years.map((year) => (
              <div key={year} className="mb-16 last:mb-0">
                {/* Year Header */}
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-display-sm text-primary-600">{year}</h2>
                  <div className="flex-1 h-px bg-neutral-200" />
                  <span className="text-sm text-neutral-400">
                    {filteredByYear[year].length} paper{filteredByYear[year].length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Publications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredByYear[year].map((pub) => (
                    <PublicationCard key={pub.id} publication={pub} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {hasActiveFilters ? 'No publications match your filters' : 'No publications yet'}
              </h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters to find what you are looking for.'
                  : 'Publications will appear here once they are added to the data/publications.csv file.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
