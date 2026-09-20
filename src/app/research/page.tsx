import { Suspense } from 'react';
import { getPublicationsByYear } from '@/lib/publications';
import { getResearchInterestOptions } from '@/lib/data';
import ResearchPageClient from '@/components/ResearchPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research',
  description: 'Publications and research work by Maty Bohacek',
};

export default function ResearchPage() {
  const publicationsByYear = getPublicationsByYear();
  const interestOptions = getResearchInterestOptions();

  return (
    <div>
      {/* The client reads ?interest= from the URL, so it needs a boundary */}
      <Suspense fallback={null}>
        <ResearchPageClient
          publicationsByYear={publicationsByYear}
          interestOptions={interestOptions}
        />
      </Suspense>
    </div>
  );
}
