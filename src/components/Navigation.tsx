'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="site-container">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Name */}
          <Link
            href="/"
            className="text-base font-bold hover:text-primary-600 transition-colors"
          >
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
                  className={`text-sm font-ui transition-colors ${
                    isActive
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900'
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
                  className={`block py-2 text-sm font-ui ${
                    isActive
                      ? 'text-neutral-900'
                      : 'text-neutral-500'
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
