// The enrichment agent: one Claude vision pass per post that (1) confirms the
// image is genuinely in-the-wild AI slop, (2) writes the "why it's AI" reasoning,
// (3) infers a location string to geocode, and (4) proposes a caption + model
// guess. Output is constrained to a schema so we get back validated JSON.

import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import * as z from 'zod/v4';
import type { Config } from './config.js';
import type { Enrichment, FetchedImage, RedditPost } from './types.js';

const EnrichmentSchema = z.object({
  isInTheWildSlop: z
    .boolean()
    .describe(
      'True only if the image shows AI-generated content on a real-world physical surface (billboard, poster, menu, packaging, store display, screen in a public place). False for screenshots, memes, pure digital images, or content that is not clearly AI-generated.',
    ),
  confidence: z.number().min(0).max(1).describe('Your confidence in isInTheWildSlop, 0 to 1.'),
  caption: z.string().describe('A short, neutral caption describing the sighting. Max 180 characters.'),
  reasoning: z
    .string()
    .describe(
      'Concise explanation of why the imagery is believed to be AI-generated, citing visible artifacts (garbled text, impossible geometry, malformed hands/logos, uncanny lighting). 1–4 sentences.',
    ),
  modelAttribution: z
    .string()
    .nullable()
    .describe('Guessed generator if clearly identifiable (e.g. "Midjourney", "Sora"), else null.'),
  locationGuess: z
    .string()
    .nullable()
    .describe(
      'Best guess of where this was physically photographed, as a geocodable place string (e.g. "Shibuya, Tokyo, Japan" or "Berlin, Germany" or just a country). Use signage text, language, license plates, architecture, and the post title. Null if there is no usable signal.',
    ),
  locationSpecificity: z
    .enum(['exact', 'city', 'country', 'unknown'])
    .describe('How precise locationGuess is.'),
  flags: z
    .array(z.string())
    .describe(
      'Any of: "location_unknown", "maybe_not_in_the_wild", "contains_people", "nsfw", "low_quality", "text_heavy". Empty array if none apply.',
    ),
});

const SYSTEM = `You are a research assistant for an academic project cataloguing AI-generated ("slop") imagery found in the real world — on billboards, posters, menus, packaging, store displays, and public screens. You analyze one image (plus its Reddit post title/body) and return a structured record.

Be conservative: only mark isInTheWildSlop=true when the image genuinely shows AI-generated content on a physical real-world surface. Screenshots of apps, memes, and purely digital images should be false. When unsure about location, say so honestly via locationSpecificity="unknown" and the "location_unknown" flag rather than inventing a place.`;

export class Enricher {
  private client: Anthropic;

  constructor(private cfg: Config['anthropic']) {
    this.client = new Anthropic({ apiKey: cfg.apiKey });
  }

  async enrich(post: RedditPost, image: FetchedImage): Promise<Enrichment> {
    const context = [
      `Reddit post title: ${post.title}`,
      post.selftext ? `Post body: ${post.selftext.slice(0, 800)}` : null,
      post.flair ? `Flair: ${post.flair}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const message = await this.client.messages.parse({
      model: this.cfg.model,
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium', format: zodOutputFormat(EnrichmentSchema) },
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: image.mime as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
                data: image.buffer.toString('base64'),
              },
            },
            {
              type: 'text',
              text: `${context}\n\nAnalyze the image and return the structured record.`,
            },
          ],
        },
      ],
    });

    if (!message.parsed_output) {
      throw new Error(`Enrichment returned no parseable output (stop_reason=${message.stop_reason}).`);
    }
    return message.parsed_output;
  }
}
