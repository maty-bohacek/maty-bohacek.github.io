// Client for the slop app's public HTTP API. The bot authenticates exactly like
// a human (POST /api/auth/login → session cookie), then submits via the same
// multipart POST /api/submissions the web form uses. Going through the API means
// we reuse the app's media processing, validation, and geocoding — no direct DB
// or volume coupling. Because the bot account is a plain USER, every submission
// lands in PENDING for super-admin review.

import type { Config } from './config.js';
import type { FetchedImage, SubmissionPayload } from './types.js';

export class SlopClient {
  private cookie: string | null = null;

  constructor(private cfg: Config['slop']) {}

  private base(path: string): string {
    return this.cfg.apiUrl.replace(/\/$/, '') + path;
  }

  async login(): Promise<void> {
    const res = await fetch(this.base('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.cfg.email, password: this.cfg.password }),
    });
    if (!res.ok) {
      throw new Error(`Slop login failed (${res.status}): ${await res.text()}`);
    }
    // Capture the session cookie to replay on submits.
    const setCookie = res.headers.get('set-cookie');
    const match = setCookie?.match(/slop_session=[^;]+/);
    if (!match) {
      throw new Error('Slop login succeeded but no session cookie was returned.');
    }
    this.cookie = match[0];
  }

  async submit(payload: SubmissionPayload, image: FetchedImage): Promise<string> {
    if (!this.cookie) throw new Error('Not logged in — call login() first.');

    const form = new FormData();
    form.set('media', new Blob([image.buffer], { type: image.mime }), image.filename);
    form.set('caption', payload.caption);
    form.set('reasoning', payload.reasoning);
    form.set('locationName', payload.locationName);
    form.set('latitude', String(payload.latitude));
    form.set('longitude', String(payload.longitude));
    form.set('locationApproximate', String(payload.locationApproximate));
    form.set('sourceType', payload.sourceType);
    form.set('sourceUrl', payload.sourceUrl);
    if (payload.modelAttribution) form.set('modelAttribution', payload.modelAttribution);
    if (payload.capturedAt) form.set('capturedAt', payload.capturedAt);

    const res = await fetch(this.base('/api/submissions'), {
      method: 'POST',
      headers: { Cookie: this.cookie },
      body: form,
    });
    if (!res.ok) {
      throw new Error(`Submit failed (${res.status}): ${await res.text()}`);
    }
    const json = (await res.json()) as { id: string; status: string };
    return json.id;
  }
}
