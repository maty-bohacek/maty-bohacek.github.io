import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="site-container py-24 text-center">
      <h1 className="text-display-sm text-neutral-900">Not found</h1>
      <p className="mt-2 font-ui text-sm text-neutral-500">
        This sighting doesn&apos;t exist, or isn&apos;t public.
      </p>
      <Link href="/" className="btn btn-primary mt-6 inline-flex">
        Back to the map
      </Link>
    </div>
  );
}
