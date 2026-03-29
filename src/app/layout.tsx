import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Maty Bohacek',
    template: '%s | Maty Bohacek',
  },
  description: 'Personal website of Maty Bohacek, researcher at Stanford University working on AI, machine learning, and their societal impact.',
  keywords: ['Maty Bohacek', 'Stanford', 'AI', 'Machine Learning', 'Research', 'Computer Science'],
  authors: [{ name: 'Maty Bohacek' }],
  creator: 'Maty Bohacek',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://matybohacek.com',
    siteName: 'Maty Bohacek',
    title: 'Maty Bohacek',
    description: 'Personal website of Maty Bohacek, researcher at Stanford University.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maty Bohacek',
    description: 'Personal website of Maty Bohacek, researcher at Stanford University.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
