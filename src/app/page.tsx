import Link from 'next/link';
import { getSiteConfig, getResearchInterests, getUpcomingEvents } from '@/lib/data';
import { getRecentLogEntries } from '@/lib/log';
import { remark } from 'remark';
import html from 'remark-html';
import LogEntry from '@/components/LogEntry';
import UpcomingItem from '@/components/UpcomingItem';
import HeadshotImage from '@/components/HeadshotImage';
import ResearchInterests from '@/components/ResearchInterests';

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html, { sanitize: false }).process(markdown);
  return result.toString();
}

// Citations in the research interests point at papers and project pages.
function openExternalLinksInNewTab(markup: string): string {
  return markup.replace(
    /<a href="(https?:\/\/[^"]*)"/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );
}

export default async function HomePage() {
  const config = getSiteConfig();
  const researchInterests = await Promise.all(
    getResearchInterests().map(async ({ body, ...interest }) => ({
      ...interest,
      bodyHtml: openExternalLinksInNewTab(await markdownToHtml(body)),
    }))
  );
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
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-ui">
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

          <div className="flex-shrink-0 order-first md:order-last [&>div]:!w-40 [&>div]:!h-40 md:[&>div]:!w-48 md:[&>div]:!h-48">
            <HeadshotImage
              src={config.headshot}
              hoverSrc="/images/headshot-hover.jpeg"
              alt={config.name}
            />
          </div>
        </div>
      </section>

      {/* Research Interests */}
      {researchInterests.length > 0 && (
        <section className="mb-16">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-6 font-ui">
            Research Interests
          </h2>
          <ResearchInterests interests={researchInterests} />
        </section>
      )}

      {/* News & Upcoming */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
          {/* Recent News */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide font-ui">
                Recent News
              </h2>
              <Link href="/journal" className="text-sm font-ui text-neutral-500 hover:text-neutral-900 transition-colors">
                All News →
              </Link>
            </div>
            <div className="divide-y divide-neutral-200">
              {recentNews.length > 0 ? (
                recentNews.map((entry) => (
                  <LogEntry key={entry.id} entry={entry} showDescription={false} showImages={false} compact />
                ))
              ) : (
                <p className="text-neutral-500 text-sm">No recent news yet.</p>
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div>
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-6 font-ui">
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
