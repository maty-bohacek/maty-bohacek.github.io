import { Metadata } from 'next';
import Image from 'next/image';
import { getSiteConfig, getSpeakingPageData, getUpcomingEvents } from '@/lib/data';
import CopyButton from '@/components/CopyButton';
import UpcomingItem from '@/components/UpcomingItem';
import { SpeakingLogo } from '@/types';

export const metadata: Metadata = {
  title: 'Speaking',
  description:
    'Talks, keynotes, and panels by Maty Bohacek on AI, media integrity, and trust online, for industry and academic audiences.',
  // Shared by link only: this page is not in the navigation and is kept out of search results.
  robots: { index: false, follow: false },
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-6 font-ui">
      {children}
    </h2>
  );
}

// A wall of grayscale logos. Heights are set per logo so that wide wordmarks
// and compact emblems carry similar visual weight.
function LogoWall({ logos }: { logos: SpeakingLogo[] }) {
  return (
    <ul className="panel px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
      {logos.map(({ name, logo, height = 22, dark }) => (
        <li key={name} className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={name}
            title={name}
            style={{ height }}
            className={`w-auto max-w-[9rem] object-contain ${dark ? 'brightness-0 opacity-60' : 'grayscale opacity-80'}`}
          />
        </li>
      ))}
    </ul>
  );
}

const textLink =
  'text-neutral-800 hover:text-neutral-950 hover:underline underline-offset-4 transition-colors';

export default function SpeakingPage() {
  const config = getSiteConfig();
  const page = getSpeakingPageData();
  const upcoming = getUpcomingEvents();
  const inviteHref = `mailto:${config.email}?subject=${encodeURIComponent('Speaking invitation')}`;

  return (
    <div className="site-container py-12 md:py-16">
      {/* Header */}
      <section className="mb-12">
        <h1 className="text-2xl font-bold font-ui tracking-tight text-neutral-900 mb-4">Speaking</h1>
        <p className="text-base text-neutral-700 leading-relaxed">{page.intro}</p>
      </section>

      {/* Photos */}
      {page.photos.length > 0 && (
        <section className="mb-16 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-5">
          {page.photos.map((photo) => (
            <figure key={photo.image}>
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <Image
                  src={photo.image}
                  alt={`${photo.event}, ${photo.location}`}
                  fill
                  sizes="(min-width: 640px) 208px, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-xs font-ui leading-snug">
                <span className="block font-medium text-neutral-800">{photo.event}</span>
                <span className="block text-neutral-500">{photo.location}</span>
              </figcaption>
            </figure>
          ))}
        </section>
      )}

      {/* Media */}
      {page.media.length > 0 && (
        <section className="mb-16">
          <SectionHeading>In the media</SectionHeading>
          <LogoWall logos={page.media} />
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="mb-16">
          <SectionHeading>Upcoming</SectionHeading>
          <div className="panel p-6">
            {upcoming.map((event) => (
              <UpcomingItem key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Past engagements */}
      {page.engagements.length > 0 && (
        <section className="mb-16">
          <SectionHeading>Past engagements</SectionHeading>
          <LogoWall logos={page.engagements} />
        </section>
      )}

      {/* Bio */}
      <section className="mb-16">
        <SectionHeading>Speaker bio</SectionHeading>
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
