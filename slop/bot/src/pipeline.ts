// Per-post pipeline: resolve image → download → enrich (Claude vision) →
// second-stage filter → geocode → build payload → submit (or dry-run). Also
// owns the shared client wiring so the two runtimes stay tiny.

import { loadConfig, type Config } from './config.js';
import { RedditClient } from './reddit.js';
import { Enricher } from './enrich.js';
import { Geocoder } from './geocode.js';
import { SlopClient } from './slop.js';
import { SeenStore } from './seen.js';
import { fetchImage } from './media.js';
import type { ProcessOutcome, RedditPost, SubmissionPayload } from './types.js';

const CONFIDENCE_THRESHOLD = 0.5;
const MAX_CAPTION = 180; // app allows 200; keep a margin
const MAX_REASONING = 5000;

export class Pipeline {
  reddit: RedditClient;
  private enricher: Enricher;
  private geocoder: Geocoder;
  private slop: SlopClient;

  constructor(
    public cfg: Config,
    private seen: SeenStore,
    private nowIso: string,
  ) {
    this.reddit = new RedditClient(cfg.reddit);
    this.enricher = new Enricher(cfg.anthropic);
    this.geocoder = new Geocoder(cfg.nominatim);
    this.slop = new SlopClient(cfg.slop);
  }

  /** Log in to the app once (skipped in dry-run). */
  async start(): Promise<void> {
    if (!this.cfg.dryRun) await this.slop.login();
  }

  /** Has this permalink already been handled in a prior run? */
  wasSeen(permalink: string): boolean {
    return this.seen.has(permalink);
  }

  /** Persist the dedup/tracking store to disk. */
  async saveState(): Promise<void> {
    await this.seen.save();
  }

  async process(post: RedditPost): Promise<ProcessOutcome> {
    if (this.seen.has(post.permalink)) {
      return { status: 'skipped', permalink: post.permalink, reason: 'already-seen' };
    }
    if (!post.imageUrl) {
      return this.skip(post, 'no-usable-image');
    }
    if (post.over18) {
      // Flag rather than silently drop — but hold NSFW out of the auto pipeline.
      return this.skip(post, 'nsfw');
    }

    const image = await fetchImage(post.imageUrl, this.cfg.reddit.userAgent);
    if (!image) return this.skip(post, 'image-fetch-failed');

    const enrichment = await this.enricher.enrich(post, image);

    if (!enrichment.isInTheWildSlop || enrichment.confidence < CONFIDENCE_THRESHOLD) {
      return this.skip(post, `filtered (confidence=${enrichment.confidence.toFixed(2)})`);
    }

    // Location: best-guess geocode, else a flagged placeholder (import-with-flag
    // policy — nothing is silently lost; the reviewer sets the real pin).
    let latitude = 0;
    let longitude = 0;
    let locationName = 'Unknown — set during review';
    let locationApproximate = true;
    const flags = [...enrichment.flags];

    if (enrichment.locationGuess && enrichment.locationSpecificity !== 'unknown') {
      const geo = await this.geocoder.geocode(enrichment.locationGuess);
      if (geo) {
        latitude = geo.latitude;
        longitude = geo.longitude;
        locationName = enrichment.locationGuess.slice(0, 200);
        locationApproximate = enrichment.locationSpecificity !== 'exact';
      } else if (!flags.includes('location_unknown')) {
        flags.push('location_unknown');
      }
    } else if (!flags.includes('location_unknown')) {
      flags.push('location_unknown');
    }

    const payload: SubmissionPayload = {
      caption: clamp(enrichment.caption || post.title, MAX_CAPTION),
      reasoning: buildReasoning(enrichment.reasoning, enrichment.confidence, flags),
      locationName,
      latitude,
      longitude,
      locationApproximate,
      sourceType: 'LINK',
      sourceUrl: post.permalink,
      modelAttribution: enrichment.modelAttribution?.slice(0, 120) ?? null,
      capturedAt: null, // Reddit post date ≠ capture date; leave for the reviewer
    };

    if (this.cfg.dryRun) {
      this.seen.record(post.permalink, { status: 'dry-run', at: this.nowIso });
      return { status: 'dry-run', permalink: post.permalink, payload };
    }

    const id = await this.slop.submit(payload, image);
    this.seen.record(post.permalink, { status: 'submitted', submissionId: id, at: this.nowIso });
    return { status: 'submitted', id, permalink: post.permalink };
  }

  private skip(post: RedditPost, reason: string): ProcessOutcome {
    this.seen.record(post.permalink, { status: 'skipped', reason, at: this.nowIso });
    return { status: 'skipped', permalink: post.permalink, reason };
  }
}

function clamp(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + '…';
}

/** Append a provenance footer so the reviewer sees where this came from. */
function buildReasoning(reasoning: string, confidence: number, flags: string[]): string {
  const footer = [
    '',
    '---',
    `Imported automatically from Reddit (r/aislop). Bot confidence: ${(confidence * 100).toFixed(0)}%.`,
    flags.length ? `Flags: ${flags.join(', ')}.` : null,
    'Review the location and AI attribution before publishing.',
  ]
    .filter(Boolean)
    .join('\n');
  return clampReasoning(reasoning.trim() + '\n' + footer);
}

function clampReasoning(s: string): string {
  return s.length <= MAX_REASONING ? s : s.slice(0, MAX_REASONING);
}

/** Build a fully-wired pipeline from env. */
export async function makePipeline(nowIso: string, statePath: string): Promise<Pipeline> {
  const cfg = loadConfig({ requireSlop: true });
  const seen = await SeenStore.load(statePath);
  const pipeline = new Pipeline(cfg, seen, nowIso);
  return pipeline;
}
