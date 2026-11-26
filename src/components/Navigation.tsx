'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Height of the sticky nav bar (h-14), so the headshot counts as gone once it
// slides under the bar rather than off the top of the window.
const NAV_HEIGHT_PX = 56;

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/research', label: 'Research' },
  { href: '/mentees', label: 'Mentees' },
  { href: '/journal', label: 'Journal' },
  { href: '/blog', label: 'Blog' },
  { href: '/press', label: 'Press' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = pathname === '/';
  const [headshotInView, setHeadshotInView] = useState(true);

  // On the home page the hero headshot already shows the face, so the nav only
  // gets one once that photo has scrolled away. Every other page always has it.
  useEffect(() => {
    if (!isHome) return;
    const headshot = document.getElementById('hero-headshot');
    if (!headshot) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeadshotInView(entry.isIntersecting),
      { rootMargin: `-${NAV_HEIGHT_PX}px 0px 0px 0px` }
    );
    observer.observe(headshot);
    return () => {
      observer.disconnect();
      setHeadshotInView(true);
    };
  }, [isHome]);

  const showFace = !isHome || !headshotInView;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="site-container">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Name */}
          <Link
            href="/"
            className="flex items-center text-base font-bold font-ui hover:text-primary-600 transition-colors"
          >
            <span
              aria-hidden="true"
              className={`nav-face${showFace ? ' is-visible' : ''}`}
            >
              <Image src="/favicon.png" alt="" width={28} height={28} loading="eager" />
            </span>
            Maty Bohacek
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`text-sm font-ui font-medium underline-offset-4 transition-colors ${
                    isActive
                      ? 'text-neutral-950 underline'
                      : 'text-neutral-800 hover:text-neutral-950 hover:underline'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block py-2 text-sm font-ui font-medium underline-offset-4 ${
                    isActive
                      ? 'text-neutral-950 underline'
                      : 'text-neutral-800'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
