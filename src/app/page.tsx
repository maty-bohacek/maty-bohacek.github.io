import Link from 'next/link';
import { getSiteConfig, getUpcomingEvents } from '@/lib/data';
import { getFeaturedPublications } from '@/lib/publications';
import { getRecentLogEntries } from '@/lib/log';
import { getAffiliationContents } from '@/lib/affiliations';
import { remark } from 'remark';
import html from 'remark-html';
import AffiliationsGrid from '@/components/AffiliationsGrid';
import PublicationCard from '@/components/PublicationCard';
import LogEntry from '@/components/LogEntry';
import UpcomingItem from '@/components/UpcomingItem';
import SectionHeader from '@/components/SectionHeader';
import HeadshotImage from '@/components/HeadshotImage';
import AsciiBackground from '@/components/AsciiBackground';

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html, { sanitize: false }).process(markdown);
  return result.toString();
}

export default async function HomePage() {
  const config = getSiteConfig();
  const affiliationContents = getAffiliationContents();
  const affiliationsWithHtml = await Promise.all(
    affiliationContents.map(async (a) => ({
      id: a.id,
      title: a.title,
      subtitle: a.subtitle,
      icon: a.icon,
      color: a.color,
      contentHtml: await markdownToHtml(a.content),
    }))
  );
  const featuredPublications = getFeaturedPublications();
  const recentNews = getRecentLogEntries(4);
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-neutral-50 relative overflow-hidden border-b border-neutral-200">
        <AsciiBackground />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Content */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <h1 className="text-display-lg lg:text-display-xl text-neutral-900 mb-4">
                {config.name}
              </h1>
              {config.title && (
                <p className="text-lg lg:text-xl text-primary-700 font-normal mb-4 italic">
                  {config.title}
                </p>
              )}
              <p className="text-base lg:text-lg text-neutral-600 leading-relaxed max-w-2xl">
                {config.bio}
              </p>

              {/* Social Links */}
              <div className="flex gap-3 mt-8">
                {config.social.scholar && (
                  <SocialLink href={config.social.scholar} label="Google Scholar">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 9a8 8 0 0 1 7.162 4.44L24 9.5z"/>
                    </svg>
                  </SocialLink>
                )}
                {config.social.github && (
                  <SocialLink href={config.social.github} label="GitHub">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </SocialLink>
                )}
                {config.social.twitter && (
                  <SocialLink href={config.social.twitter} label="Twitter">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </SocialLink>
                )}
                {config.social.linkedin && (
                  <SocialLink href={config.social.linkedin} label="LinkedIn">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </SocialLink>
                )}
              </div>
            </div>

            {/* Headshot */}
            <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Decorative elements - subtle academic style */}
                <div className="absolute -top-3 -left-3 w-20 h-20 bg-primary-200 -z-10 opacity-60" />
                <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-primary-100 -z-10 opacity-60" />
                <HeadshotImage
                  src={config.headshot}
                  hoverSrc="/images/headshot-hover.jpeg"
                  alt={config.name}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Publications */}
      <section className="bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <SectionHeader
            title="Selected Publications"
            subtitle="Highlights from my research work"
            viewAllLink="/research"
            viewAllText="View all publications"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPublications.length > 0 ? (
              featuredPublications.map((pub) => (
                <PublicationCard key={pub.id} publication={pub} />
              ))
            ) : (
              <p className="col-span-full text-neutral-500 text-center py-12">
                No featured publications yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* News & Upcoming */}
      <section className="bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Recent News */}
            <div>
              <SectionHeader
                title="Recent News"
                viewAllLink="/journal"
                viewAllText="View all"
              />
              <div className="bg-white border border-neutral-200 divide-y divide-neutral-200">
                {recentNews.length > 0 ? (
                  recentNews.map((entry) => (
                    <div key={entry.id} className="p-4">
                      <LogEntry entry={entry} />
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-neutral-500 text-center">
                    No recent news yet.
                  </p>
                )}
              </div>
            </div>

            {/* Upcoming */}
            <div>
              <SectionHeader title="Upcoming" />
              <div className="bg-white border border-neutral-200 p-6">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <UpcomingItem key={event.id} event={event} />
                  ))
                ) : (
                  <p className="text-neutral-500 text-center py-4">
                    No upcoming events scheduled.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliations Grid */}
      {affiliationsWithHtml.length > 0 && (
        <section className="bg-white border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <AffiliationsGrid affiliations={affiliationsWithHtml} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <h2 className="text-display-md text-white mb-6">
              Have questions or ideas for future research?
            </h2>
            <p className="text-base text-neutral-300 mb-8 leading-relaxed">
              I am always open to discussing new research ideas, potential collaborations,
              or just chatting about AI and its impact on media and society.
            </p>
            <a
              href={`mailto:${config.email}`}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-normal px-6 py-3 transition-colors"
            >
              Get in touch
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-9 h-9 bg-neutral-100 hover:bg-primary-50 text-neutral-500 hover:text-primary-600 transition-colors"
      aria-label={label}
    >
      {children}
    </a>
  );
}
