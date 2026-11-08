// Categories for journal entries, in the order their filter chips appear.
//
// Give each entry in content/log/ one or more of these ids in its frontmatter:
//   categories: ["academic"]
//   categories: ["academic", "awards"]   (shows under both filters)
//
// Kept free of Node imports so the client-side filter can use it.
export const JOURNAL_CATEGORIES = [
  // Papers, academic conferences and workshops, and talks at universities and research labs
  { id: 'academic', label: 'Academic' },
  // Talks and panels at industry, public, and policy events
  { id: 'industry', label: 'Industry' },
  // TV, radio, and print appearances and commentary
  { id: 'media', label: 'Media' },
  // Honors and prizes
  { id: 'awards', label: 'Awards' },
  // Project launches and releases
  { id: 'milestones', label: 'Milestones' },
] as const;

export type JournalCategoryId = (typeof JOURNAL_CATEGORIES)[number]['id'];

export const JOURNAL_CATEGORY_IDS: readonly string[] = JOURNAL_CATEGORIES.map((c) => c.id);
