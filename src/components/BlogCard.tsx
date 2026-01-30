import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const categoryColors: Record<string, string> = {
  Research: 'bg-primary-100 text-primary-700',
  'AI & Democracy': 'bg-swiss-blue/10 text-swiss-blue',
  Books: 'bg-swiss-teal/10 text-swiss-teal',
  Movies: 'bg-swiss-pink/10 text-swiss-pink',
  Miscellaneous: 'bg-swiss-orange/10 text-swiss-orange',
};

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const { slug, title, excerpt, date, category, tags, coverImage, readingTime } = post;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (featured) {
    return (
      <article className="group">
        <Link href={`/blog/${slug}`} className="block">
          {coverImage && (
            <div className="aspect-[16/9] bg-neutral-100 overflow-hidden mb-6">
              <Image
                src={coverImage}
                alt={title}
                width={800}
                height={450}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-semibold px-2 py-1 ${categoryColors[category] || categoryColors.Miscellaneous}`}>
              {category}
            </span>
            <time dateTime={date} className="text-sm text-neutral-500">
              {formattedDate}
            </time>
            {readingTime && (
              <span className="text-sm text-neutral-400">{readingTime}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors mb-3">
            {title}
          </h2>
          <p className="text-neutral-600 leading-relaxed line-clamp-3">
            {excerpt}
          </p>
        </Link>
      </article>
    );
  }

  return (
    <article className="group border border-neutral-200 hover:border-primary-300 bg-white transition-all duration-200 hover:shadow-md">
      <Link href={`/blog/${slug}`} className="block">
        {coverImage && (
          <div className="aspect-[16/9] bg-neutral-100 overflow-hidden">
            <Image
              src={coverImage}
              alt={title}
              width={400}
              height={225}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-0.5 ${categoryColors[category] || categoryColors.Miscellaneous}`}>
              {category}
            </span>
            {readingTime && (
              <span className="text-xs text-neutral-400">{readingTime}</span>
            )}
          </div>
          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
            {excerpt}
          </p>
          <time dateTime={date} className="text-xs text-neutral-400">
            {formattedDate}
          </time>
        </div>
      </Link>
    </article>
  );
}
