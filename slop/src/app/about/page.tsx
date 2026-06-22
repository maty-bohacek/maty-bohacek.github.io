import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="site-container py-12 md:py-16">
      <h1 className="text-display-sm text-neutral-900">About</h1>

      <div className="mt-6 space-y-5 leading-relaxed text-neutral-700">
        <p>
          This project aims to build a community-sourced map of AI-generated imagery and video
          appearing in the physical world—as billboards, store displays, posters, menus, packaging,
          screens, and other modalities. Each pin marks a sighting, along with where it was seen and
          the reason it&apos;s believed to be AI-generated. Anyone can{' '}
          <Link href="/register" className="text-primary-600 underline">register</Link> and
          contribute.
        </p>

        <p>
          Submissions include a photo or short video, a location, a caption, and an explanation —
          either a description of the tell-tale signs or a link to an AI-detector result. You can
          optionally name the model you suspect, but please only do so when you&apos;re highly
          confident; attributions are shown as <em>claims</em>, not verified facts.
        </p>

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
