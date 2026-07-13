// Dedup / tracking store. The app's public API only lists APPROVED submissions,
// so pending imports aren't queryable there — we keep our own record of every
// Reddit permalink we've already handled (submitted, skipped, or rejected by the
// filter). The weekly GitHub Action commits this file back so state persists
// across runs. Keyed by permalink.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export type SeenStatus = 'submitted' | 'dry-run' | 'skipped';

interface SeenEntry {
  status: SeenStatus;
  reason?: string;
  submissionId?: string;
  at: string; // ISO timestamp, passed in (no wall-clock calls buried in logic)
}

export class SeenStore {
  private map = new Map<string, SeenEntry>();

  private constructor(private path: string) {}

  static async load(path: string): Promise<SeenStore> {
    const store = new SeenStore(path);
    try {
      const raw = await readFile(path, 'utf8');
      const obj = JSON.parse(raw) as Record<string, SeenEntry>;
      for (const [k, v] of Object.entries(obj)) store.map.set(k, v);
    } catch {
      // First run — no file yet.
    }
    return store;
  }

  has(permalink: string): boolean {
    return this.map.has(permalink);
  }

  record(permalink: string, entry: SeenEntry): void {
    this.map.set(permalink, entry);
  }

  get size(): number {
    return this.map.size;
  }

  async save(): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    const obj: Record<string, SeenEntry> = {};
    for (const [k, v] of this.map) obj[k] = v;
    await writeFile(this.path, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  }
}
