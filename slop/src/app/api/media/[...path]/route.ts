import { Readable } from 'node:stream';
import { contentTypeForExt } from '@/lib/media';
import { uploadReadStream, uploadStat } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE = 'public, max-age=31536000, immutable';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const relKey = path.join('/');
  const ext = relKey.split('.').pop() ?? '';

  const info = await uploadStat(relKey);
  if (!info) return new Response('Not found', { status: 404 });

  const type = contentTypeForExt(ext);
  const total = info.size;
  const baseHeaders: Record<string, string> = {
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    'Cache-Control': CACHE,
    'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': 'inline',
  };

  const range = request.headers.get('range');
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    let start = match && match[1] ? parseInt(match[1], 10) : 0;
    let end = match && match[2] ? parseInt(match[2], 10) : total - 1;
    if (Number.isNaN(start)) start = 0;
    if (Number.isNaN(end) || end >= total) end = total - 1;

    if (start > end || start >= total) {
      return new Response('Range Not Satisfiable', {
        status: 416,
        headers: { 'Content-Range': `bytes */${total}` },
      });
    }

    const stream = uploadReadStream(relKey, start, end);
    const web = Readable.toWeb(stream) as unknown as ReadableStream;
    return new Response(web, {
      status: 206,
      headers: {
        ...baseHeaders,
        'Content-Length': String(end - start + 1),
        'Content-Range': `bytes ${start}-${end}/${total}`,
      },
    });
  }

  const stream = uploadReadStream(relKey);
  const web = Readable.toWeb(stream) as unknown as ReadableStream;
  return new Response(web, {
    status: 200,
    headers: { ...baseHeaders, 'Content-Length': String(total) },
  });
}
