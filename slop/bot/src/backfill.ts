// Historical backfill (one-shot, manually triggered).
//
// Paginates both flair queries to Reddit's ~1000-post listing cap, runs every
// post through the pipeline, and imports survivors as PENDING. Safe to re-run:
// the seen-store dedups, so a second run only picks up posts added since the
// first. Trigger via `npm run backfill` (or the workflow's manual dispatch).

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { makePipeline } from './pipeline.js';
import type { ProcessOutcome, RedditPost } from './types.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = resolve(HERE, '..', 'state', 'seen.json');

async function main() {
  const nowIso = new Date().toISOString();
  const pipeline = await makePipeline(nowIso, STATE_PATH);
  await pipeline.start();

  const tally = { submitted: 0, skipped: 0, dryRun: 0, errors: 0 };
  console.log(
    `[backfill] subreddit=r/${pipeline.cfg.reddit.subreddit} flairs=${JSON.stringify(
      pipeline.cfg.reddit.flairs,
    )} dryRun=${pipeline.cfg.dryRun} maxPosts=${pipeline.cfg.maxPosts}`,
  );

  for (const flair of pipeline.cfg.reddit.flairs) {
    console.log(`\n[backfill] === flair: "${flair}" ===`);
    await pipeline.reddit.eachFlairPost(
      flair,
      async (posts: RedditPost[]) => {
        for (const post of posts) {
          try {
            const outcome = await pipeline.process(post);
            record(tally, outcome);
          } catch (err) {
            tally.errors++;
            console.error(`[backfill] ERROR ${post.permalink}:`, (err as Error).message);
          }
        }
        // Persist progress after each page so a crash mid-run isn't lost.
        await pipeline.saveState();
        return true; // keep paginating to the cap
      },
      pipeline.cfg.maxPosts,
    );
  }

  await pipeline.saveState();
  console.log(
    `\n[backfill] done — submitted=${tally.submitted} dryRun=${tally.dryRun} skipped=${tally.skipped} errors=${tally.errors}`,
  );
}

function record(
  tally: { submitted: number; skipped: number; dryRun: number; errors: number },
  outcome: ProcessOutcome,
) {
  if (outcome.status === 'submitted') {
    tally.submitted++;
    console.log(`[backfill] submitted ${outcome.id}  ${outcome.permalink}`);
  } else if (outcome.status === 'dry-run') {
    tally.dryRun++;
    console.log(`[backfill] dry-run  ${outcome.permalink} → ${outcome.payload.locationName}`);
  } else {
    tally.skipped++;
  }
}

main().catch((err) => {
  console.error('[backfill] fatal:', err);
  process.exit(1);
});
