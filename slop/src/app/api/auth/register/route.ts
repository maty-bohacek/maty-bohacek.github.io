import { prisma } from '@/lib/db';
import { hashPassword, isSuperAdminEmail, normalizeEmail } from '@/lib/auth';
import { setSession } from '@/lib/session';
import { registerSchema, fieldErrors } from '@/lib/validation';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp, fail, ok } from '@/lib/http';

export async function POST(request: Request) {
  const limit = rateLimit(`register:${clientIp(request)}`, 10, 10 * 60 * 1000);
  if (!limit.ok) return fail('Too many attempts. Try again later.', 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body.');
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return fail('Please fix the errors below.', 422, { fields: fieldErrors(parsed.error) });

  const email = normalizeEmail(parsed.data.email);

  if (isSuperAdminEmail(email)) {
    return fail('This email address is reserved.', 409, { fields: { email: 'This email address is reserved.' } });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail('An account with this email already exists.', 409, {
      fields: { email: 'An account with this email already exists.' },
    });
  }

  const user = await prisma.user.create({
    data: {
      email,
      displayName: parsed.data.displayName,
      passwordHash: await hashPassword(parsed.data.password),
      role: 'USER',
    },
  });

  await setSession(user.id);
  return ok({ ok: true, user: { displayName: user.displayName, role: user.role } });
}
