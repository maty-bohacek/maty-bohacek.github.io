import { getPressEntriesByYear } from '@/lib/press';
import LogEntry from '@/components/LogEntry';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press',
  description: 'Press highlights — media coverage, articles, podcasts, and mentions of Maty Bohacek',
};

export default function PressPage() {
  const entriesByYear = getPressEntriesByYear();
  const years = Object.keys(entriesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const totalEntries = Object.values(entriesByYear).flat().length;

  return (
    <div className="site-container py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Press Highlights</h1>
        <p className="text-base text-neutral-600 leading-relaxed">
          Selected media coverage, articles, podcasts, and mentions.
        </p>
        {totalEntries > 0 && (
          <p className="mt-2 text-sm text-neutral-400">
            {totalEntries} highlight{totalEntries !== 1 ? 's' : ''} across {years.length} year{years.length !== 1 ? 's' : ''}
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
          <p className="text-neutral-500 text-sm">No press highlights yet.</p>
        </div>
      )}
    </div>
  );
}
