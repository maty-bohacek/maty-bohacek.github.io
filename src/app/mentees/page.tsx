import Link from 'next/link';
import { Metadata } from 'next';
import { getActiveMentees, getPastMentees, getMentoredPublications } from '@/lib/mentees';
import MenteeCard from '@/components/MenteeCard';

export const metadata: Metadata = {
  title: 'Mentees',
  description: 'Students and researchers mentored by Maty Bohacek',
};

export default function MenteesPage() {
  const activeMentees = getActiveMentees();
  const pastMentees = getPastMentees();
  const mentoredPublications = getMentoredPublications();

  return (
    <div className="site-container py-12 md:py-16">
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Mentees</h1>
        <p className="text-base text-neutral-600 leading-relaxed">
          Students and researchers I have had the privilege of mentoring.
        </p>
      </div>

      {/* Active mentees */}
      {activeMentees.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10">
          {activeMentees.map((mentee) => (
            <MenteeCard key={mentee.id} mentee={mentee} />
          ))}
        </div>
      )}

      {/* Past mentees */}
      {pastMentees.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wide">Past Mentees</h2>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10">
            {pastMentees.map((mentee) => (
              <MenteeCard key={mentee.id} mentee={mentee} />
            ))}
          </div>
        </div>
      )}

      {/* Mentored publications */}
      {mentoredPublications.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wide">Mentored Publications</h2>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>
          <ol className="space-y-4">
            {mentoredPublications.map(({ number, publication }) => {
              const { title, authors, venue, year, links } = publication;
              return (
                <li
                  key={publication.id}
                  id={`mentored-pub-${number}`}
                  className="flex gap-3 scroll-mt-20"
                >
                  <span className="font-ui text-xs text-neutral-400 pt-0.5 select-none">[{number}]</span>
                  <div className="text-sm">
                    <span className="font-medium text-neutral-900">
                      {links.paper || links.project ? (
                        <Link
                          href={(links.paper || links.project)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-600 transition-colors"
                        >
                          {title}
                        </Link>
                      ) : (
                        title
                      )}
                    </span>
                    <span className="text-neutral-500">
                      {' '}— {authors}.{' '}
                      <span className="italic">{venue}</span>, {year}.
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {activeMentees.length === 0 && pastMentees.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-neutral-500 text-sm">No mentees listed yet.</p>
        </div>
      )}
    </div>
  );
}
