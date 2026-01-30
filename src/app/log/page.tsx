import { getLogEntriesByYear } from '@/lib/log';
import LogEntry from '@/components/LogEntry';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log',
  description: 'Updates, news, and activities from Maty Bohacek',
};

export default function LogPage() {
  const entriesByYear = getLogEntriesByYear();
  const years = Object.keys(entriesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const totalEntries = Object.values(entriesByYear).flat().length;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <h1 className="text-display-lg text-neutral-900 mb-4">Log</h1>
          <p className="text-xl text-neutral-600 max-w-3xl">
            Updates, news, talks, and activities. A chronological record of what is happening.
          </p>
          {totalEntries > 0 && (
            <p className="mt-4 text-sm text-neutral-500">
              {totalEntries} entries across {years.length} year{years.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* Log Entries by Year */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
          {years.length > 0 ? (
            years.map((year) => (
              <div key={year} className="mb-16 last:mb-0">
                {/* Year Header - Swiss style */}
                <div className="sticky top-16 z-10 bg-white py-4 border-b-2 border-primary-500 mb-6">
                  <h2 className="text-display-sm text-primary-600">{year}</h2>
                </div>

                {/* Entries */}
                <div>
                  {entriesByYear[year].map((entry) => (
                    <LogEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No log entries yet</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                Log entries will appear here once they are added to the content/log folder.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
