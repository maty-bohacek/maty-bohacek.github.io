import { z } from 'zod';
import {
  MAX_CAPTION_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_MODEL_LENGTH,
  MAX_REASONING_LENGTH,
  MIN_CAPTURE_YEAR,
} from './constants';

// A capture date supplied by the client as a calendar day (`YYYY-MM-DD`).
// Validated for realness, sane range, and not being in the future.
export const captureDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date (YYYY-MM-DD).')
  .refine((s) => {
    // Reject impossible dates like 2026-02-31 via a round-trip.
    const t = Date.parse(`${s}T12:00:00Z`);
    return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s;
  }, 'Enter a real calendar date.')
  .refine((s) => Number(s.slice(0, 4)) >= MIN_CAPTURE_YEAR, 'That date is too far in the past.')
  .refine(
    // Allow a day of slack so a "today" in any timezone is accepted.
    (s) => Date.parse(`${s}T12:00:00Z`) <= Date.now() + 24 * 60 * 60 * 1000,
    'The date can’t be in the future.',
  );

/** Convert a validated `YYYY-MM-DD` to a stable Date at noon UTC. */
export function captureDateToDate(s: string): Date {
  return new Date(`${s}T12:00:00.000Z`);
}

// Fields an author may edit on an existing submission: the capture date ("date
// taken"), the reasoning ("why it's believed to be AI"), the source, and the
// location (label, coordinates, and the "approximate" flag). All fields are
// optional so the client can PATCH just the one being edited; at least one must
// be present.
export const submissionEditSchema = z
  .object({
    capturedAt: captureDateSchema.optional(),
    reasoning: z
      .string()
      .trim()
      .min(10, 'Explain why you believe this is AI-generated.')
      .max(MAX_REASONING_LENGTH, 'Reasoning is too long.')
      .optional(),
    sourceType: z.enum(['LINK', 'ORIGINAL']).optional(),
    sourceUrl: z
      .string()
      .trim()
      .url('Enter a valid URL.')
      .max(2000)
      .optional()
      .or(z.literal('')),
    locationName: z
      .string()
      .trim()
      .min(2, 'Add a location label.')
      .max(MAX_LOCATION_LENGTH, 'Location is too long.')
      .optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    locationApproximate: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.capturedAt !== undefined ||
      d.reasoning !== undefined ||
      d.sourceType !== undefined ||
      d.sourceUrl !== undefined ||
      d.locationName !== undefined ||
      d.latitude !== undefined ||
      d.longitude !== undefined ||
      d.locationApproximate !== undefined,
    { message: 'Nothing to update.' },
  )
  .refine((d) => d.sourceType !== 'LINK' || (d.sourceUrl && d.sourceUrl.length > 0), {
    message: 'A source link is required when the source is a link.',
    path: ['sourceUrl'],
  })
  // Latitude and longitude must be edited together to stay consistent.
  .refine((d) => (d.latitude === undefined) === (d.longitude === undefined), {
    message: 'Set both coordinates.',
    path: ['latitude'],
  });

export const registerSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(200),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters.')
    .max(60, 'Display name is too long.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(200, 'Password is too long.'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const submissionMetaSchema = z
  .object({
    caption: z
      .string()
      .trim()
      .min(3, 'Add a short caption.')
      .max(MAX_CAPTION_LENGTH, 'Caption is too long.'),
    reasoning: z
      .string()
      .trim()
      .min(10, 'Explain why you believe this is AI-generated.')
      .max(MAX_REASONING_LENGTH, 'Reasoning is too long.'),
    locationName: z
      .string()
      .trim()
      .min(2, 'Add a location label.')
      .max(MAX_LOCATION_LENGTH, 'Location is too long.'),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    // True when the submitter wasn't sure of the exact spot.
    locationApproximate: z.boolean().optional(),
    sourceType: z.enum(['LINK', 'ORIGINAL']),
    sourceUrl: z
      .string()
      .trim()
      .url('Enter a valid URL.')
      .max(2000)
      .optional()
      .or(z.literal('')),
    modelAttribution: z
      .string()
      .trim()
      .max(MAX_MODEL_LENGTH, 'Model name is too long.')
      .optional()
      .or(z.literal('')),
    // When the photo/video was taken. Sent by the form (from EXIF or the user);
    // tolerated as empty so submissions never hard-fail on a missing date.
    capturedAt: captureDateSchema.optional().or(z.literal('')),
  })
  .refine((d) => d.sourceType !== 'LINK' || (d.sourceUrl && d.sourceUrl.length > 0), {
    message: 'A source link is required when the source is a link.',
    path: ['sourceUrl'],
  });

// Self-service account settings the signed-in user can change.
export const meUpdateSchema = z.object({
  publicProfile: z.boolean(),
});

export const reviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const adminUpdateSchema = z
  .object({
    role: z.enum(['USER', 'TRUSTED', 'REVIEWER']).optional(),
    banned: z.boolean().optional(),
  })
  .refine((d) => d.role !== undefined || d.banned !== undefined, {
    message: 'Nothing to update.',
  });

export type SubmissionMeta = z.infer<typeof submissionMetaSchema>;

/** Format a ZodError into a flat field->message map for the client. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
