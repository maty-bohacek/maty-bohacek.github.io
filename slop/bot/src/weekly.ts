// Live incremental run (weekly cron).
//
// Same pipeline as the backfill, but only walks far enough back to catch what's
// new since last time: it stops paginating a flair once it hits a run of posts
// it has already seen. Emits a short run report. Trigger via `npm run weekly`
// (the GitHub Action runs this on a schedule).

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { makePipeline } from './pipeline.js';
import type { ProcessOutcome, RedditPost } from './types.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = resolve(HERE, '..', 'state', 'seen.json');

// Stop a flair once we've seen this many already-known posts in a row — enough
// overlap that reordering/edits near the boundary don't make us miss anything.
const SEEN_STREAK_STOP = 25;

async function main() {
  const nowIso = new Date().toISOString();
  const pipeline = await makePipeline(nowIso, STATE_PATH);
  await pipeline.start();

  const tally = { scanned: 0, submitted: 0, skipped: 0, dryRun: 0, dupes: 0, errors: 0 };
  console.log(
    `[weekly] subreddit=r/${pipeline.cfg.reddit.subreddit} flairs=${JSON.stringify(
      pipeline.cfg.reddit.flairs,
    )} dryRun=${pipeline.cfg.dryRun}`,
  );

  for (const flair of pipeline.cfg.reddit.flairs) {
    let streak = 0;
    await pipeline.reddit.eachFlairPost(
      flair,
      async (posts: RedditPost[]) => {
        for (const post of posts) {
          tally.scanned++;
          if (pipeline.wasSeen(post.permalink)) {
            tally.dupes++;
            streak++;
            continue;
          }
          streak = 0;
          try {
            const outcome = await pipeline.process(post);
            record(tally, outcome);
          } catch (err) {
            tally.errors++;
            console.error(`[weekly] ERROR ${post.permalink}:`, (err as Error).message);
          }
        }
        await pipeline.saveState();
        // Once we've hit a solid run of already-seen posts, the rest is old.
        return streak < SEEN_STREAK_STOP;
      },
      pipeline.cfg.maxPosts,
    );
  }

  await pipeline.saveState();
  console.log(
    `\n[weekly] done — scanned=${tally.scanned} submitted=${tally.submitted} dryRun=${tally.dryRun} skipped=${tally.skipped} dupes=${tally.dupes} errors=${tally.errors}`,
  );
}

function record(
  tally: { submitted: number; skipped: number; dryRun: number },
  outcome: ProcessOutcome,
) {
  if (outcome.status === 'submitted') {
    tally.submitted++;
    console.log(`[weekly] submitted ${outcome.id}  ${outcome.permalink}`);
  } else if (outcome.status === 'dry-run') {
    tally.dryRun++;
    console.log(`[weekly] dry-run  ${outcome.permalink} → ${outcome.payload.locationName}`);
  } else {
    tally.skipped++;
  }
}

main().catch((err) => {
  console.error('[weekly] fatal:', err);
  process.exit(1);
});
