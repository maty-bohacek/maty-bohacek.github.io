import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { canPublishDirectly } from '@/lib/roles';
import { processUpload } from '@/lib/media';
import { newMediaKey, saveUpload } from '@/lib/storage';
import { submissionMetaSchema, fieldErrors } from '@/lib/validation';
import {
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from '@/lib/constants';
import { rateLimit } from '@/lib/ratelimit';
import { fail, ok } from '@/lib/http';
import { captureDateToDate } from '@/lib/validation';
import {
  buildApprovedWhere,
  serializeSubmission,
  MAP_ORDER_BY,
  type MapFilters,
} from '@/lib/submissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_RESULTS = 2000;

// ── GET: approved submissions for the public map / gallery ────────────────
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;

  const filters: MapFilters = {};
  const search = sp.get('search')?.trim();
  if (search) filters.search = search;
  const model = sp.get('model')?.trim();
  if (model) filters.model = model;

  const sourceType = sp.get('sourceType');
  if (sourceType === 'LINK' || sourceType === 'ORIGINAL') filters.sourceType = sourceType;

  const mediaType = sp.get('mediaType');
  if (mediaType === 'IMAGE' || mediaType === 'VIDEO') filters.mediaType = mediaType;

  const from = sp.get('from');
  if (from && !Number.isNaN(Date.parse(from))) filters.from = new Date(from);
  const to = sp.get('to');
  if (to && !Number.isNaN(Date.parse(to))) {
    // Treat `to` as inclusive of the whole day.
    const d = new Date(to);
    d.setUTCHours(23, 59, 59, 999);
    filters.to = d;
  }

  const submissions = await prisma.submission.findMany({
    where: buildApprovedWhere(filters),
    include: { author: { select: { displayName: true, publicProfile: true } } },
    orderBy: MAP_ORDER_BY,
    take: MAX_RESULTS,
  });

  return ok({ submissions: submissions.map((s) => serializeSubmission(s)) });
}

// ── POST: create a submission (multipart form with a media file) ──────────
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail('You must be logged in to submit.', 401);

  const limit = rateLimit(`submit:${user.id}`, 30, 60 * 60 * 1000);
  if (!limit.ok) return fail('You are submitting too quickly. Try again later.', 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('Invalid form submission.');
  }

  const file = form.get('media');
  if (!(file instanceof File) || file.size === 0) {
    return fail('Please attach a photo or video.', 422, { fields: { media: 'A file is required.' } });
  }

  const mime = file.type;
  const isImage = (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mime);
  const isVideo = (ALLOWED_VIDEO_MIMES as readonly string[]).includes(mime);
  if (!isImage && !isVideo) {
    return fail('Unsupported file type. Upload a JPG, PNG, WebP, GIF, MP4, or WebM.', 422, {
      fields: { media: 'Unsupported file type.' },
    });
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return fail(`File is too large. Max ${mb} MB for ${isImage ? 'images' : 'videos'}.`, 422, {
      fields: { media: `Max ${mb} MB.` },
    });
  }

  const meta = submissionMetaSchema.safeParse({
    caption: form.get('caption'),
    reasoning: form.get('reasoning'),
    locationName: form.get('locationName'),
    latitude: form.get('latitude'),
    longitude: form.get('longitude'),
    sourceType: form.get('sourceType'),
    sourceUrl: form.get('sourceUrl') ?? '',
    modelAttribution: form.get('modelAttribution') ?? '',
    capturedAt: form.get('capturedAt') ?? '',
  });
  if (!meta.success) {
    return fail('Please fix the errors below.', 422, { fields: fieldErrors(meta.error) });
  }
  const data = meta.data;
  const capturedAt = data.capturedAt ? captureDateToDate(data.capturedAt) : null;

  // Process + store media.
  let processed;
  try {
    processed = await processUpload(Buffer.from(await file.arrayBuffer()), mime);
  } catch {
    return fail('We could not process that file. Try a different one.', 422, {
      fields: { media: 'Could not process this file.' },
    });
  }

  const mainKey = newMediaKey(processed.mainExt);
  await saveUpload(mainKey, processed.mainBuffer);

  let thumbKey: string | null = null;
  if (processed.thumbBuffer && processed.thumbExt) {
    thumbKey = newMediaKey(processed.thumbExt);
    await saveUpload(thumbKey, processed.thumbBuffer);
  }

  const publishNow = canPublishDirectly(user.role);

  const submission = await prisma.submission.create({
    data: {
      authorId: user.id,
      mediaType: processed.mediaType,
      mediaPath: mainKey,
      thumbPath: thumbKey,
      mediaWidth: processed.width ?? null,
      mediaHeight: processed.height ?? null,
      mediaMime: processed.mainMime,
      latitude: data.latitude,
      longitude: data.longitude,
      locationName: data.locationName,
      caption: data.caption,
      reasoning: data.reasoning,
      modelAttribution: data.modelAttribution ? data.modelAttribution : null,
      sourceType: data.sourceType,
      sourceUrl: data.sourceType === 'LINK' ? data.sourceUrl || null : null,
      capturedAt,
      status: publishNow ? 'APPROVED' : 'PENDING',
      reviewedAt: publishNow ? new Date() : null,
    },
  });

  return ok({ ok: true, id: submission.id, status: submission.status }, 201);
}
