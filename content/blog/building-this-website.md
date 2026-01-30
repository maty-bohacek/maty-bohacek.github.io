---
title: "Building a Researcher Website with Swiss Design Principles"
excerpt: "A technical walkthrough of how I built this website using Next.js, Tailwind CSS, and Swiss design principles. Includes code examples and design decisions."
date: "2025-10-01"
category: "Miscellaneous"
tags: ["web development", "design", "Next.js", "tutorial"]
coverImage: "/images/blog/swiss-design.jpg"
---

I recently rebuilt my personal website from scratch. Here's how I approached it.

## Design Inspiration: Swiss Style

Swiss design (also known as International Typographic Style) emerged in the 1950s and is characterized by:

- **Clean grids**: Mathematical precision in layout
- **Bold typography**: Large, sans-serif fonts
- **Minimalism**: Focus on essential content
- **Geometric shapes**: Rectangles, circles, and clean lines

## Technical Stack

- **Next.js 14**: For static site generation
- **Tailwind CSS v4**: For utility-first styling
- **TypeScript**: For type safety
- **Markdown**: For content management

## Key Design Decisions

### Color Palette

I chose green as my primary color, complemented by bold accent colors typical of Swiss design:

```css
:root {
  --color-primary-500: #22c55e;
  --color-swiss-red: #e53935;
  --color-swiss-blue: #1e88e5;
  --color-swiss-orange: #fb8c00;
}
```

### Typography Scale

Swiss design emphasizes typographic hierarchy:

```css
.text-display-xl {
  font-size: 5rem;
  line-height: 1;
  letter-spacing: -0.02em;
  font-weight: 700;
}
```

### Grid System

Content is organized in a strict grid:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {affiliations.map(block => (
    <AffiliationBlock key={block.id} {...block} />
  ))}
</div>
```

## Content Management

Blog posts are written in Markdown with frontmatter:

```yaml
---
title: "My Post Title"
date: "2025-10-01"
category: "Research"
tags: ["AI", "research"]
---
```

## Deployment

The site is deployed on GitHub Pages with automatic builds via GitHub Actions.

## Resources

- [Swiss Design Principles](https://en.wikipedia.org/wiki/International_Typographic_Style)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

Feel free to explore the [source code](https://github.com/maty-bohacek/maty-bohacek.github.io) for more details.
