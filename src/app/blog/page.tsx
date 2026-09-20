import { Suspense } from 'react';
import { getBlogPosts } from '@/lib/blog';
import { getResearchInterestOptions } from '@/lib/data';
import BlogPageClient from '@/components/BlogPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts, tutorials, and deep-dives on research, AI, and technology by Maty Bohacek',
};

export default function BlogPage() {
  const posts = getBlogPosts();
  const interestOptions = getResearchInterestOptions();

  return (
    /* The client reads ?interest= from the URL, so it needs a boundary */
    <Suspense fallback={null}>
      <BlogPageClient posts={posts} interestOptions={interestOptions} />
    </Suspense>
  );
}
