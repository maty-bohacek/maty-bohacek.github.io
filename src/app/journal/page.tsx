import { getLogEntries } from '@/lib/log';
import JournalPageClient from '@/components/JournalPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Updates, news, and activities from Maty Bohacek',
};

export default function JournalPage() {
  return <JournalPageClient entries={getLogEntries()} />;
}
