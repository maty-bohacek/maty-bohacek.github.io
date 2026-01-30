import { getPublicationsByYear } from '@/lib/publications';
import PublicationCard from '@/components/PublicationCard';
import SectionHeader from '@/components/SectionHeader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research',
  description: 'Publications and research work by Maty Bohacek',
};

export default function ResearchPage() {
  const publicationsByYear = getPublicationsByYear();
  const years = Object.keys(publicationsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const totalPublications = Object.values(publicationsByYear).flat().length;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <h1 className="text-display-lg text-neutral-900 mb-4">Research</h1>
          <p className="text-xl text-neutral-600 max-w-3xl">
            A complete list of my research publications, primarily in AI, computer vision, and media integrity.
          </p>
          {totalPublications > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium text-neutral-500">
                {totalPublications} publication{totalPublications !== 1 ? 's' : ''}
              </span>
              <span className="text-neutral-300">|</span>
              <span className="text-sm font-medium text-neutral-500">
                {years.length} year{years.length !== 1 ? 's' : ''} of research
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Publications by Year */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          {years.length > 0 ? (
            years.map((year) => (
              <div key={year} className="mb-16 last:mb-0">
                {/* Year Header */}
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-display-sm text-primary-600">{year}</h2>
                  <div className="flex-1 h-px bg-neutral-200" />
                  <span className="text-sm text-neutral-400">
                    {publicationsByYear[year].length} paper{publicationsByYear[year].length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Publications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicationsByYear[year].map((pub) => (
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
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No publications yet</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                Publications will appear here once they are added to the data/publications.csv file.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
