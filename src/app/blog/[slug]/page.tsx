import { getBlogPosts, getBlogPostBySlug } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import BlogContent from '@/components/BlogContent';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getBlogPosts();
  if (posts.length === 0) {
    // Next.js output: export requires at least one param for dynamic routes.
    // Return a placeholder that will render as a 404 page.
    return [{ slug: '_not-found' }];
  }
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="min-h-screen">
      {/* Header */}
      <header className="site-container pt-12 pb-8">
        <Link
          href="/blog"
          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8 inline-block"
        >
          ← Back to Blog
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-neutral-500">
          <span>{post.category}</span>
          <span>·</span>
          <time dateTime={post.date}>{formattedDate}</time>
          {post.readingTime && (
            <>
              <span>·</span>
              <span>{post.readingTime}</span>
            </>
          )}
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-4 leading-snug">
          {post.title}
        </h1>

        <p className="text-base text-neutral-600 leading-relaxed">
          {post.excerpt}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-ui px-2 py-0.5 bg-neutral-100 text-neutral-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="site-container mb-8">
          <div className="aspect-[2/1] bg-neutral-200 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={600}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <BlogContent content={post.content} />
      </div>

      {/* Footer Navigation */}
      <div className="site-container border-t border-neutral-200 py-8">
        <div className="flex justify-between items-center text-sm">
          <Link
            href="/blog"
            className="text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            ← Back to Blog
          </Link>

          <div className="flex items-center gap-4 text-neutral-400">
            <span className="text-xs">Share:</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://matybohacek.com/blog/${slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors text-xs font-ui"
              aria-label="Share on Twitter"
            >
              Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://matybohacek.com/blog/${slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors text-xs font-ui"
              aria-label="Share on LinkedIn"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
