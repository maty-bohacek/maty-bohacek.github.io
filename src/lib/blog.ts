import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost } from '@/types';

const postsDirectory = path.join(process.cwd(), 'content', 'blog');

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export function getBlogPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const posts = fileNames
      .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
      .map((fileName) => {
        const slug = fileName.replace(/\.mdx?$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          slug,
          title: data.title || slug,
          excerpt: data.excerpt || content.slice(0, 200).replace(/[#*`]/g, '') + '...',
          content,
          date: data.date || new Date().toISOString(),
          category: data.category || 'Miscellaneous',
          tags: data.tags || [],
          coverImage: data.coverImage || undefined,
          readingTime: calculateReadingTime(content),
        } as BlogPost;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const mdPath = path.join(postsDirectory, `${slug}.md`);
    const mdxPath = path.join(postsDirectory, `${slug}.mdx`);

    let fullPath = '';
    if (fs.existsSync(mdPath)) {
      fullPath = mdPath;
    } else if (fs.existsSync(mdxPath)) {
      fullPath = mdxPath;
    } else {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      excerpt: data.excerpt || content.slice(0, 200).replace(/[#*`]/g, '') + '...',
      content,
      date: data.date || new Date().toISOString(),
      category: data.category || 'Miscellaneous',
      tags: data.tags || [],
      coverImage: data.coverImage || undefined,
      readingTime: calculateReadingTime(content),
    };
  } catch (error) {
    console.error('Error loading blog post:', error);
    return null;
  }
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return getBlogPosts().filter((post) => post.category === category);
}

export function getAllTags(): string[] {
  const posts = getBlogPosts();
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function getAllCategories(): string[] {
  return ['Research', 'Impact', 'Miscellaneous'];
}
