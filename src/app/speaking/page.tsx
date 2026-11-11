import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getSiteConfig, getUpcomingEvents } from '@/lib/data';
import { countCountries, getSpeakingEngagements, getSpeakingPageData } from '@/lib/speaking';
import AudienceTag from '@/components/AudienceTag';
import CopyButton from '@/components/CopyButton';
import SpeakingEngagements from '@/components/SpeakingEngagements';
import UpcomingItem from '@/components/UpcomingItem';
import { ArrowUpRightIcon } from '@/components/Icons';
import { SpeakingEngagement } from '@/types';

export const metadata: Metadata = {
  title: 'Speaking',
  description:
    'Talks, keynotes, and panels by Maty Bohacek on AI, media integrity, and trust online, for industry and academic audiences.',
  // Shared by link only: this page is not in the navigation and is kept out of search results.
  robots: { index: false, follow: false },
};

function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="scroll-mt-20 text-sm font-bold text-neutral-900 uppercase tracking-wide mb-6 font-ui">
      {children}
    </h2>
  );
}

const textLink =
  'text-neutral-800 hover:text-neutral-950 hover:underline underline-offset-4 transition-colors';

export default function SpeakingPage() {
  const config = getSiteConfig();
  const page = getSpeakingPageData();
  const engagements = getSpeakingEngagements();
  const upcoming = getUpcomingEvents();
  const inviteHref = `mailto:${config.email}?subject=${encodeURIComponent('Speaking invitation')}`;

  const firstYear = Math.min(...engagements.map((e) => new Date(e.date).getUTCFullYear()));
  const stats = [
    { value: engagements.length, label: 'Engagements' },
    { value: countCountries(engagements), label: 'Countries' },
    { value: engagements.filter((e) => /keynote/i.test(e.format)).length, label: 'Keynotes' },
    { value: firstYear, label: 'Speaking since' },
  ];

  const gallery = page.gallery
    .map((id) => engagements.find((e) => e.id === id))
    .filter((e): e is SpeakingEngagement => Boolean(e?.image));

  return (
    <div className="site-container py-12 md:py-16">
      {/* Header */}
      <section className="mb-12">
        <h1 className="text-2xl font-bold font-ui tracking-tight text-neutral-900 mb-4">Speaking</h1>
        <p className="text-base text-neutral-700 leading-relaxed mb-6">{page.intro}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-ui font-medium">
          <a href={inviteHref} className={textLink}>Invite me to speak</a>
          <a href="#bio" className={textLink}>Speaker bio &amp; headshot</a>
          <Link href="/press" className={textLink}>Press</Link>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-y-6 border-t border-neutral-200 pt-6">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold font-ui tracking-tight text-neutral-900">{value}</p>
              <p className="text-xs font-ui uppercase tracking-wide text-neutral-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Photos */}
      {gallery.length > 0 && (
        <section className="mb-16 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-5">
          {gallery.map((e) => (
            <figure key={e.id}>
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <Image
                  src={e.image!}
                  alt={`${e.format} at ${e.event}`}
                  fill
                  sizes="(min-width: 640px) 208px, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-xs font-ui leading-snug">
                <span className="block font-medium text-neutral-800">{e.event}</span>
                <span className="block text-neutral-500">
                  {e.format}
                  {e.location && ` · ${e.location.split(',')[0]}`}
                </span>
              </figcaption>
            </figure>
          ))}
        </section>
      )}

      {/* Audiences */}
      <section className="mb-16">
        <SectionHeading>Who I speak to</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {page.audiences.map((a) => (
            <div key={a.id} className="panel p-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <AudienceTag audience={a.id} />
                <span className="text-xs font-ui text-neutral-500">
                  {engagements.filter((e) => e.audiences.includes(a.id)).length} engagements
                </span>
              </div>
              <h3 className="font-ui font-bold text-lg text-neutral-900 leading-snug">{a.label}</h3>
              <p className="mt-2 text-sm text-neutral-700 leading-relaxed">{a.summary}</p>
              <p className="mt-3 text-sm text-neutral-700 leading-relaxed">
                <span className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-500">Formats </span>
                {a.formats}.
              </p>
              <p className="mt-3 text-sm text-neutral-700 leading-relaxed">
                <span className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-500">Including </span>
                {a.highlights.join(' · ')}
              </p>
            </div>
          ))}
        </div>
        {page.media.length > 0 && (
          <p className="mt-6 text-sm text-neutral-600 leading-relaxed">
            <span className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-500">In the media </span>
            {page.media.join(' · ')}{' '}
            <Link href="/press" className="inline-flex items-center gap-0.5 font-ui text-xs text-neutral-500 hover:text-neutral-900 transition-colors whitespace-nowrap">
              All press
              <ArrowUpRightIcon className="w-3 h-3" />
            </Link>
          </p>
        )}
      </section>

      {/* Talks */}
      <section className="mb-16">
        <SectionHeading>Talks</SectionHeading>
        <div className="space-y-4">
          {page.topics.map((topic) => {
            const givenAt = [
              ...new Set(engagements.filter((e) => e.topic === topic.id).map((e) => e.event)),
            ];
            return (
              <article key={topic.id} className="panel p-6">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {topic.audiences.map((a) => (
                    <AudienceTag key={a} audience={a} />
                  ))}
                </div>
                <h3 className="font-ui font-bold text-lg text-neutral-900 leading-snug">{topic.title}</h3>
                {topic.subtitle && (
                  <p className="font-ui text-sm text-neutral-500 leading-snug mt-0.5">{topic.subtitle}</p>
                )}
                <p className="mt-3 text-[15px] text-neutral-700 leading-relaxed">{topic.summary}</p>
                {givenAt.length > 0 && (
                  <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                    <span className="font-ui text-xs font-semibold uppercase tracking-wide text-neutral-500">Previously at </span>
                    {givenAt.join(' · ')}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Engagements */}
      <section className="mb-16">
        {upcoming.length > 0 && (
          <div className="mb-12">
            <SectionHeading>Upcoming</SectionHeading>
            <div className="panel p-6">
              {upcoming.map((event) => (
                <UpcomingItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
        <SectionHeading>Past engagements</SectionHeading>
        <SpeakingEngagements engagements={engagements} />
      </section>

      {/* Bio */}
      <section className="mb-16">
        <SectionHeading id="bio">Speaker bio</SectionHeading>
        <div className="panel p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden bg-neutral-100">
              <Image src={config.headshot} alt={config.name} fill sizes="96px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] text-neutral-700 leading-relaxed">{page.bio}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                <CopyButton text={page.bio} label="Copy bio" />
                <a href={config.headshot} download className={`text-sm font-ui font-medium ${textLink}`}>
                  Download headshot
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-neutral-200 pt-10">
        <p className="text-base text-neutral-700 leading-relaxed">
          To invite me to speak, email me at{' '}
          <a href={inviteHref} className="text-primary-600 hover:text-primary-700 underline underline-offset-2">
            {config.email}
          </a>{' '}
          with the event, date, audience, and format you have in mind.
        </p>
      </section>
    </div>
  );
}
