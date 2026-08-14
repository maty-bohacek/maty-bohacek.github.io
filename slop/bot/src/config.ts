// Central configuration, read from environment variables. Nothing sensitive is
// ever hard-coded — the bot reads every credential from the environment (a
// GitHub Actions secret in production, a local .env for development).

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. See slop/bot/.env.example.`,
    );
  }
  return v.trim();
}

function optional(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() !== '' ? v.trim() : fallback;
}

/** Config the whole pipeline needs. Call once at the start of a run. */
export function loadConfig(opts: { requireSlop: boolean }) {
  const dryRun = optional('DRY_RUN', 'false').toLowerCase() === 'true';

  return {
    reddit: {
      clientId: required('REDDIT_CLIENT_ID'),
      clientSecret: required('REDDIT_CLIENT_SECRET'),
      username: required('REDDIT_USERNAME'),
      password: required('REDDIT_PASSWORD'),
      userAgent: optional(
        'REDDIT_USER_AGENT',
        'web:slop-research-importer:0.1.0 (by /u/unknown)',
      ),
      subreddit: optional('SUBREDDIT', 'aislop'),
      flairs: optional('FLAIRS', 'Found in the wild,Found IRL')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    },
    anthropic: {
      apiKey: required('ANTHROPIC_API_KEY'),
      model: optional('ANTHROPIC_MODEL', 'claude-opus-4-8'),
    },
    nominatim: {
      contact: optional('NOMINATIM_CONTACT', 'anonymous@example.com'),
    },
    slop: {
      // Only required when we're actually going to submit (not in DRY_RUN).
      apiUrl: opts.requireSlop && !dryRun ? required('SLOP_API_URL') : optional('SLOP_API_URL', ''),
      email: opts.requireSlop && !dryRun ? required('SLOP_BOT_EMAIL') : optional('SLOP_BOT_EMAIL', ''),
      password:
        opts.requireSlop && !dryRun ? required('SLOP_BOT_PASSWORD') : optional('SLOP_BOT_PASSWORD', ''),
    },
    dryRun,
    maxPosts: Number.parseInt(optional('MAX_POSTS', '1000'), 10) || 1000,
  };
}

export type Config = ReturnType<typeof loadConfig>;
