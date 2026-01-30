import { getBlogPosts, getAllTags } from '@/lib/blog';
import BlogPageClient from '@/components/BlogPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts, tutorials, and deep-dives on research, AI, and technology by Maty Bohacek',
};

export default function BlogPage() {
  const posts = getBlogPosts();
  const allTags = getAllTags();

  return <BlogPageClient posts={posts} allTags={allTags} />;
}
