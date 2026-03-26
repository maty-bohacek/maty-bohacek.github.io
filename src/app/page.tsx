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
import HeadshotImage from '@/components/HeadshotImage';

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
    <div className="site-container py-12 md:py-16">
      {/* Hero */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">
              {config.name}
            </h1>
            {config.title && (
              <p className="text-base text-neutral-500 italic mb-4">
                {config.title}
              </p>
            )}
            <p className="text-base text-neutral-700 leading-relaxed mb-6">
              {config.bio}
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {config.social.scholar && (
                <a href={config.social.scholar} target="_blank" rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-neutral-900 transition-colors">
                  Scholar
                </a>
              )}
              {config.social.github && (
                <a href={config.social.github} target="_blank" rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-neutral-900 transition-colors">
                  GitHub
                </a>
              )}
              {config.social.twitter && (
                <a href={config.social.twitter} target="_blank" rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-neutral-900 transition-colors">
                  Twitter
                </a>
              )}
              {config.social.linkedin && (
                <a href={config.social.linkedin} target="_blank" rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-neutral-900 transition-colors">
                  LinkedIn
                </a>
              )}
              <a href={`mailto:${config.email}`}
                className="text-neutral-500 hover:text-neutral-900 transition-colors">
                Email
              </a>
            </div>
          </div>

          <div className="flex-shrink-0 [&>div]:!w-40 [&>div]:!h-40 md:[&>div]:!w-48 md:[&>div]:!h-48">
            <HeadshotImage
              src={config.headshot}
              hoverSrc="/images/headshot-hover.jpeg"
              alt={config.name}
            />
          </div>
        </div>
      </section>

      {/* Selected Publications */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wide text-sm">
            Selected Publications
          </h2>
          <Link href="/research" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            All publications →
          </Link>
        </div>
        <div className="space-y-4">
          {featuredPublications.length > 0 ? (
            featuredPublications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))
          ) : (
            <p className="text-neutral-500 text-sm">No featured publications yet.</p>
          )}
        </div>
      </section>

      {/* News & Upcoming */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
          {/* Recent News */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                Recent News
              </h2>
              <Link href="/journal" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                All →
              </Link>
            </div>
            <div className="divide-y divide-neutral-100">
              {recentNews.length > 0 ? (
                recentNews.map((entry) => (
                  <LogEntry key={entry.id} entry={entry} />
                ))
              ) : (
                <p className="text-neutral-500 text-sm">No recent news yet.</p>
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div>
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-6">
              Upcoming
            </h2>
            <div>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <UpcomingItem key={event.id} event={event} />
                ))
              ) : (
                <p className="text-neutral-500 text-sm">No upcoming events.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Affiliations */}
      {affiliationsWithHtml.length > 0 && (
        <section className="mb-16">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-6">
            Affiliations
          </h2>
          <AffiliationsGrid affiliations={affiliationsWithHtml} />
        </section>
      )}

      {/* Contact */}
      <section className="border-t border-neutral-200 pt-10">
        <p className="text-base text-neutral-700 leading-relaxed">
          Whether you are a researcher exploring collaboration ideas, a journalist writing about AI,
          a policymaker seeking insight, or an educator looking to apply AI in new ways &mdash;
          I would love to hear from you at{' '}
          <a href={`mailto:${config.email}`} className="text-primary-600 hover:text-primary-700 underline underline-offset-2">
            {config.email}
          </a>.
        </p>
      </section>
    </div>
  );
}
