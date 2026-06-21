'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { UserRole } from '@prisma/client';
import { canManageUsers, canReview } from '@/lib/roles';

type NavUser = { displayName: string; role: UserRole } | null;

export default function SlopNav({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const links: { href: string; label: string }[] = [{ href: '/', label: 'Map' }];
  if (user) {
    links.push({ href: '/submit', label: 'Submit' });
    links.push({ href: '/my', label: 'My submissions' });
    if (canReview(user.role)) links.push({ href: '/review', label: 'Review' });
    if (canManageUsers(user.role)) links.push({ href: '/admin/users', label: 'Users' });
  }
  links.push({ href: '/about', label: 'About' });

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    setOpen(false);
    router.replace('/');
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-[1100] bg-white/95 backdrop-blur border-b border-neutral-200">
      <div className="wide-container">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-base font-bold hover:text-primary-600 transition-colors">
            AI Slop <span className="font-normal text-neutral-400">in the Wild</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-ui transition-colors ${
                  isActive(item.href)
                    ? 'text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <span className="h-4 w-px bg-neutral-200" />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-ui text-neutral-500 max-w-[10rem] truncate">
                  {user.displayName}
                </span>
                <button onClick={logout} disabled={loggingOut} className="btn btn-ghost btn-sm">
                  {loggingOut ? '…' : 'Log out'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-ui text-neutral-500 hover:text-neutral-900">
                  Log in
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-neutral-200 py-3">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block py-2 text-sm font-ui ${
                  isActive(item.href) ? 'text-neutral-900' : 'text-neutral-500'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-neutral-200 mt-2 pt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-ui text-neutral-500 truncate">{user.displayName}</span>
                  <button onClick={logout} disabled={loggingOut} className="btn btn-secondary btn-sm">
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm flex-1">
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary btn-sm flex-1">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
