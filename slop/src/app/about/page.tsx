import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="site-container py-12 md:py-16">
      <h1 className="text-display-sm text-neutral-900">About</h1>

      <div className="mt-6 space-y-5 leading-relaxed text-neutral-700">
        <p>
          <strong>AI Slop in the Wild</strong> is a community-built map of AI-generated imagery and
          video appearing in the physical world — on billboards, store displays, posters, menus,
          packaging, and screens. Each pin marks a sighting, along with where it was seen and the
          reason it&apos;s believed to be AI-generated.
        </p>

        <p>
          Anyone can <Link href="/register" className="text-primary-600 underline">register</Link>{' '}
          and contribute. Submissions include a photo or short video, a location, a caption, and an
          explanation — either a description of the tell-tale signs or a link to an AI-detector
          result. You can optionally name the model you suspect, but please only do so when you&apos;re
          highly confident; attributions are shown as <em>claims</em>, not verified facts.
        </p>

        <h2 className="pt-4 text-lg font-bold text-neutral-900">Contributor tiers</h2>
        <ul className="space-y-2">
          <li>
            <strong>User</strong> — submissions are reviewed before appearing on the map.
          </li>
          <li>
            <strong>Trusted</strong> — submissions publish to the map immediately.
          </li>
          <li>
            <strong>Reviewer</strong> — publishes immediately, and helps approve or reject others&apos;
            submissions.
          </li>
        </ul>

        <p className="font-ui text-sm text-neutral-500">
          A side project by{' '}
          <a href="https://matybohacek.com" className="text-primary-600 underline">
            Maty Bohacek
          </a>
          . Maps &copy; OpenStreetMap contributors.
        </p>
      </div>
    </div>
  );
}
