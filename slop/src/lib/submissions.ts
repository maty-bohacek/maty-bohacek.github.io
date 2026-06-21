import type { Prisma, Submission, SubmissionStatus, User } from '@prisma/client';

export function mediaUrl(key: string): string {
  return `/api/media/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export type SerializedSubmission = {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbUrl: string | null;
  mediaWidth: number | null;
  mediaHeight: number | null;
  latitude: number;
  longitude: number;
  locationName: string;
  caption: string;
  reasoning: string;
  modelAttribution: string | null;
  sourceType: 'LINK' | 'ORIGINAL';
  sourceUrl: string | null;
  authorName: string;
  createdAt: string;
  status: SubmissionStatus;
  reviewNote?: string | null;
};

type WithAuthor = Submission & { author?: Pick<User, 'displayName'> | null };

export function serializeSubmission(
  s: WithAuthor,
  opts: { includeStatus?: boolean; includeReviewNote?: boolean } = {},
): SerializedSubmission {
  return {
    id: s.id,
    mediaType: s.mediaType,
    mediaUrl: mediaUrl(s.mediaPath),
    thumbUrl: s.thumbPath ? mediaUrl(s.thumbPath) : null,
    mediaWidth: s.mediaWidth,
    mediaHeight: s.mediaHeight,
    latitude: s.latitude,
    longitude: s.longitude,
    locationName: s.locationName,
    caption: s.caption,
    reasoning: s.reasoning,
    modelAttribution: s.modelAttribution,
    sourceType: s.sourceType,
    sourceUrl: s.sourceUrl,
    authorName: s.author?.displayName ?? 'Unknown',
    createdAt: s.createdAt.toISOString(),
    status: s.status,
    ...(opts.includeReviewNote ? { reviewNote: s.reviewNote } : {}),
  };
}

export type MapFilters = {
  search?: string;
  model?: string;
  sourceType?: 'LINK' | 'ORIGINAL';
  mediaType?: 'IMAGE' | 'VIDEO';
  from?: Date;
  to?: Date;
};

/** Build a Prisma `where` for the public map: approved items matching filters. */
export function buildApprovedWhere(filters: MapFilters): Prisma.SubmissionWhereInput {
  const where: Prisma.SubmissionWhereInput = { status: 'APPROVED' };
  const and: Prisma.SubmissionWhereInput[] = [];

  if (filters.search) {
    and.push({
      OR: [
        { caption: { contains: filters.search, mode: 'insensitive' } },
        { locationName: { contains: filters.search, mode: 'insensitive' } },
        { reasoning: { contains: filters.search, mode: 'insensitive' } },
        { modelAttribution: { contains: filters.search, mode: 'insensitive' } },
      ],
    });
  }
  if (filters.model) {
    and.push({ modelAttribution: { contains: filters.model, mode: 'insensitive' } });
  }
  if (filters.sourceType) where.sourceType = filters.sourceType;
  if (filters.mediaType) where.mediaType = filters.mediaType;
  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: filters.from } : {}),
      ...(filters.to ? { lte: filters.to } : {}),
    };
  }
  if (and.length) where.AND = and;
  return where;
}
