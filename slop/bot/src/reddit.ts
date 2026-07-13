// Reddit access: OAuth (script app, password grant) + flair-filtered fetching.
// Uses the official API with an authenticated account and a descriptive
// User-Agent, per Reddit's API rules. Images-only: video posts are dropped here.

import type { Config } from './config.js';
import type { RedditPost } from './types.js';

const OAUTH = 'https://oauth.reddit.com';
const TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)(\?.*)?$/i;

export class RedditClient {
  private token: string | null = null;
  private tokenExpiry = 0;

  constructor(private cfg: Config['reddit']) {}

  private async accessToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry - 60_000) return this.token;

    const basic = Buffer.from(`${this.cfg.clientId}:${this.cfg.clientSecret}`).toString('base64');
    const body = new URLSearchParams({
      grant_type: 'password',
      username: this.cfg.username,
      password: this.cfg.password,
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.cfg.userAgent,
      },
      body,
    });
    if (!res.ok) {
      throw new Error(`Reddit auth failed (${res.status}): ${await res.text()}`);
    }
    const json = (await res.json()) as { access_token: string; expires_in: number };
    this.token = json.access_token;
    this.tokenExpiry = Date.now() + json.expires_in * 1000;
    return this.token;
  }

  private async api(path: string, params: Record<string, string>): Promise<any> {
    const token = await this.accessToken();
    const url = new URL(OAUTH + path);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': this.cfg.userAgent,
      },
    });
    if (res.status === 429) {
      // Respect rate limiting: wait and retry once.
      const retry = Number(res.headers.get('retry-after') ?? '5');
      await sleep(retry * 1000);
      return this.api(path, params);
    }
    if (!res.ok) {
      throw new Error(`Reddit API ${path} failed (${res.status}): ${await res.text()}`);
    }
    return res.json();
  }

  /**
   * Fetch flair-filtered posts, newest first, page by page.
   *
   * @param flair      the exact flair text to match (e.g. "Found in the wild")
   * @param onPage     called with each page of posts; return false to stop
   *                   paginating early (used by the weekly incremental run).
   * @param maxPosts   hard ceiling (Reddit lists ~1000 max regardless).
   */
  async eachFlairPost(
    flair: string,
    onPage: (posts: RedditPost[]) => boolean | Promise<boolean>,
    maxPosts: number,
  ): Promise<void> {
    let after: string | undefined;
    let seen = 0;

    while (seen < maxPosts) {
      const data = await this.api(`/r/${this.cfg.subreddit}/search`, {
        q: `flair_name:"${flair}"`,
        restrict_sr: 'true',
        sort: 'new',
        limit: '100',
        raw_json: '1',
        ...(after ? { after } : {}),
      });

      const children: any[] = data?.data?.children ?? [];
      if (children.length === 0) break;

      const posts = children.map((c) => toPost(c.data)).filter((p): p is RedditPost => p !== null);
      seen += children.length;

      const keepGoing = await onPage(posts);
      if (keepGoing === false) break;

      after = data?.data?.after ?? undefined;
      if (!after) break;

      // Gentle pacing: stay well within ~60 req/min.
      await sleep(1200);
    }
  }
}

/** Map a raw Reddit post object to our trimmed shape (images only). */
function toPost(d: any): RedditPost | null {
  if (!d || d.is_self) return null; // text posts have no media
  if (d.is_video) return null; // images-only MVP — skip videos

  const imageUrl = resolveImageUrl(d);

  return {
    id: d.id,
    permalink: `https://www.reddit.com${d.permalink}`,
    title: (d.title ?? '').toString(),
    author: (d.author ?? '[deleted]').toString(),
    createdUtc: Number(d.created_utc ?? 0),
    selftext: (d.selftext ?? '').toString(),
    flair: d.link_flair_text ?? null,
    over18: Boolean(d.over_18),
    imageUrl,
  };
}

/** Resolve a fetchable still-image URL from a post, or null. */
function resolveImageUrl(d: any): string | null {
  const url: string = (d.url_overridden_by_dest ?? d.url ?? '').toString();

  // Direct image link or i.redd.it hosted image.
  if (IMAGE_EXT.test(url) || /(^|\/\/)i\.redd\.it\//.test(url)) return url;

  // Reddit gallery — take the first item.
  if (d.is_gallery && d.gallery_data?.items?.length && d.media_metadata) {
    const firstId = d.gallery_data.items[0]?.media_id;
    const meta = firstId ? d.media_metadata[firstId] : undefined;
    const src: string | undefined = meta?.s?.u ?? meta?.s?.gif;
    if (src) return unescapeHtml(src);
  }

  // Fall back to Reddit's own generated preview (post_hint "image").
  if (d.post_hint === 'image' && d.preview?.images?.length) {
    const src: string | undefined = d.preview.images[0]?.source?.url;
    if (src) return unescapeHtml(src);
  }

  // Anything else (external article, imgur album page, etc.) — not a still
  // image we can reliably fetch in the MVP.
  return null;
}

function unescapeHtml(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
