// Shared types across the pipeline.

/** A flair-filtered Reddit post, trimmed to what we use. */
export interface RedditPost {
  id: string;
  permalink: string; // full https URL back to the post (our sourceUrl)
  title: string;
  author: string;
  createdUtc: number; // seconds
  selftext: string; // post body, if any
  flair: string | null;
  over18: boolean;
  /** The image we'll download, already resolved to a fetchable URL, or null
   *  when the post has no usable still image (video-only, external page, etc.). */
  imageUrl: string | null;
}

/** A fetched, in-memory image ready to submit. */
export interface FetchedImage {
  buffer: Buffer;
  mime: string;
  filename: string;
}

/** The structured result of the Claude vision enrichment pass. */
export interface Enrichment {
  /** Second-stage filter: is this genuinely in-the-wild AI slop (a real-world
   *  surface — billboard, menu, poster, packaging, screen), not a screenshot,
   *  meme, or pure digital repost? */
  isInTheWildSlop: boolean;
  /** 0–1 confidence in the above judgement. */
  confidence: number;
  /** A clean, short caption (≤ 180 chars). */
  caption: string;
  /** Why this is believed to be AI-generated (visible artifacts). */
  reasoning: string;
  /** Guessed generator, or null. */
  modelAttribution: string | null;
  /** Best-guess place string for geocoding (e.g. "Times Square, New York" or
   *  "Tokyo, Japan" or a country), or null when there's no usable signal. */
  locationGuess: string | null;
  /** How precise locationGuess is. */
  locationSpecificity: 'exact' | 'city' | 'country' | 'unknown';
  /** Triage flags surfaced to the human reviewer. */
  flags: string[];
}

/** The final payload posted to the app's /api/submissions endpoint. */
export interface SubmissionPayload {
  caption: string;
  reasoning: string;
  locationName: string;
  latitude: number;
  longitude: number;
  locationApproximate: boolean;
  sourceType: 'LINK';
  sourceUrl: string;
  modelAttribution: string | null;
  capturedAt: string | null; // YYYY-MM-DD, or null
}

export type ProcessOutcome =
  | { status: 'submitted'; id: string; permalink: string }
  | { status: 'dry-run'; permalink: string; payload: SubmissionPayload }
  | { status: 'skipped'; permalink: string; reason: string };
