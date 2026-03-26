import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-16">
      <div className="site-container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-neutral-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link>
            <Link href="/research" className="hover:text-neutral-900 transition-colors">Research</Link>
            <Link href="/journal" className="hover:text-neutral-900 transition-colors">Journal</Link>
            <Link href="/blog" className="hover:text-neutral-900 transition-colors">Blog</Link>
          </div>
          <p className="text-neutral-400 text-xs">
            &copy; {new Date().getFullYear()} Maty Bohacek
          </p>
        </div>
      </div>
    </footer>
  );
}
