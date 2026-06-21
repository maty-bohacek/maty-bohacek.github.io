import { z } from 'zod';
import {
  MAX_CAPTION_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_MODEL_LENGTH,
  MAX_REASONING_LENGTH,
} from './constants';

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
  })
  .refine((d) => d.sourceType !== 'LINK' || (d.sourceUrl && d.sourceUrl.length > 0), {
    message: 'A source link is required when the source is a link.',
    path: ['sourceUrl'],
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
