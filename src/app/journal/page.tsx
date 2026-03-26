import { getLogEntriesByYear } from '@/lib/log';
import LogEntry from '@/components/LogEntry';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Updates, news, and activities from Maty Bohacek',
};

export default function JournalPage() {
  const entriesByYear = getLogEntriesByYear();
  const years = Object.keys(entriesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const totalEntries = Object.values(entriesByYear).flat().length;

  return (
    <div className="site-container py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Journal</h1>
        <p className="text-base text-neutral-600 leading-relaxed">
          A chronological record of what I&apos;m up to.
        </p>
        {totalEntries > 0 && (
          <p className="mt-2 text-sm text-neutral-400">
            {totalEntries} entries across {years.length} year{years.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {years.length > 0 ? (
        years.map((year) => (
          <div key={year} className="mb-12 last:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wide">{year}</h2>
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
          <p className="text-neutral-500 text-sm">No journal entries yet.</p>
        </div>
      )}
    </div>
  );
}
