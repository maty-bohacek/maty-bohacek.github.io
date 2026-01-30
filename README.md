# Maty Bohacek - Personal Website

A personal researcher website built with Next.js, Tailwind CSS, and Swiss design principles.

## Features

- **Landing Page**: Headshot, bio, affiliations grid, news feed, upcoming events, selected publications
- **Research Page**: Full list of publications organized by year
- **Log Page**: Chronological updates with year breakpoints
- **Blog**: Full-featured blog with categories, tags, search, and rich content support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS v4
- **Content**: Markdown files for blog/log, CSV for publications
- **Deployment**: GitHub Pages with static export

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### Building

```bash
npm run build
```

This generates a static site in the `out/` directory.

## Content Management

### Publications (`data/publications.csv`)

Add publications as rows in the CSV file:

```csv
id,title,authors,venue,year,abstract,thumbnail,paper_url,project_url,code_url,data_url,video_url,slides_url,featured,tags
my-paper,"Paper Title","Author 1, Author 2","Conference Name",2024,"Abstract text...",/images/pub.png,https://...,,,,,true,"tag1;tag2"
```

### Blog Posts (`content/blog/`)

Create Markdown files with frontmatter:

```yaml
---
title: "Post Title"
excerpt: "Brief description"
date: "2024-01-15"
category: "Research"  # Research | Impact | Miscellaneous
tags: ["AI", "research"]
coverImage: "/images/blog/cover.jpg"
---

Your content here...
```

### Log Entries (`content/log/`)

Create Markdown files with frontmatter:

```yaml
---
date: "2024-01-15"
title: "Entry Title"
link: "https://optional-link.com"
linkText: "Optional link text"
tags: ["paper", "milestone"]
---

Entry description...
```

### Site Configuration (`data/config.json`)

Update personal info, bio, and social links.

### Affiliations (`data/affiliations.json`)

Configure the grid of affiliation blocks on the homepage.

### Upcoming Events (`data/upcoming.json`)

Add upcoming talks, conferences, and events.

## Google Scholar Integration

Use the provided Python script to import publications:

```bash
cd scripts
pip install -r requirements.txt
python scholar_scraper.py --scholar-id YOUR_ID --output ../data/publications.csv
```

## Design

The site follows Swiss/International Typographic Style principles:

- Clean grid layouts
- Bold typography with clear hierarchy
- Green primary color with bold accent colors
- Geometric shapes and clean lines
- Minimalist aesthetic

## Deployment

The site auto-deploys to GitHub Pages on push to main/master via GitHub Actions.

Manual deployment:

```bash
npm run build
# Upload contents of 'out/' to your hosting provider
```

## License

MIT License - feel free to use this as a template for your own site.
