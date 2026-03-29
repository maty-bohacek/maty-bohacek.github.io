'use client';

import { useState, useMemo } from 'react';
import BlogCard from '@/components/BlogCard';
import { BlogPost } from '@/types';

interface BlogPageClientProps {
  posts: BlogPost[];
  allTags: string[];
}

export default function BlogPageClient({ posts, allTags }: BlogPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const categories = ['Research', 'AI & Democracy', 'Books', 'Movies', 'Miscellaneous'];

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = !selectedCategory || post.category === selectedCategory;

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => post.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [posts, searchQuery, selectedCategory, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTags([]);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedTags.length > 0;

  const postsByYear = useMemo(() => {
    const grouped: Record<number, BlogPost[]> = {};
    for (const post of filteredPosts) {
      const year = new Date(post.date).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(post);
    }
    return grouped;
  }, [filteredPosts]);

  const years = useMemo(() =>
    Object.keys(postsByYear).map(Number).sort((a, b) => b - a),
    [postsByYear]
  );

  return (
    <div className="site-container py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Blog</h1>
        <p className="text-base text-neutral-600 leading-relaxed">
          My thoughts on research, AI&apos;s impact on our democracy, and anything else that interests me. Updated irregularly.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-10 space-y-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 focus:border-neutral-400 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`px-3 py-1 text-xs font-ui transition-colors ${
                selectedCategory === category
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-xs font-ui transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-xs text-neutral-400 mb-8">
        {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
      </p>

      {/* Posts */}
      {years.length > 0 ? (
        years.map((year) => (
          <div key={year} className="mb-12 last:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wide">{year}</h2>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {postsByYear[year].map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="py-16 text-center">
          <p className="text-neutral-500 text-sm">
            {hasActiveFilters ? 'No posts match your filters.' : 'No blog posts yet.'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 text-sm text-neutral-500 underline underline-offset-2">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
