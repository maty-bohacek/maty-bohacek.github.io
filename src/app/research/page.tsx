import { getPublicationsByYear, getAllKeywords } from '@/lib/publications';
import ResearchPageClient from '@/components/ResearchPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research',
  description: 'Publications and research work by Maty Bohacek',
};

export default function ResearchPage() {
  const publicationsByYear = getPublicationsByYear();
  const allKeywords = getAllKeywords();

  return (
    <div>
      <ResearchPageClient publicationsByYear={publicationsByYear} allKeywords={allKeywords} />
    </div>
  );
}
