import type { Metadata } from 'next';
import './globals.css';
import SlopNav from '@/components/SlopNav';
import SlopFooter from '@/components/SlopFooter';
import { getCurrentUser } from '@/lib/session';

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  ...(appUrl ? { metadataBase: new URL(appUrl) } : {}),
  title: {
    default: 'AI Slop in the Wild',
    template: '%s | AI Slop in the Wild',
  },
  description:
    'A community-built map of AI-generated imagery and video spotted out in the real world.',
  openGraph: {
    type: 'website',
    siteName: 'AI Slop in the Wild',
    title: 'AI Slop in the Wild',
    description:
      'A community-built map of AI-generated imagery and video spotted out in the real world.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Slop in the Wild',
    description:
      'A community-built map of AI-generated imagery and video spotted out in the real world.',
  },
  icons: { icon: '/favicon.png', apple: '/apple-icon.png' },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const navUser = user ? { displayName: user.displayName, role: user.role } : null;

  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 min-h-screen flex flex-col">
        <SlopNav user={navUser} />
        <main className="flex-1">{children}</main>
        <SlopFooter />
      </body>
    </html>
  );
}
