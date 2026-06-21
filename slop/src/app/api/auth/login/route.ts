import { prisma } from '@/lib/db';
import { normalizeEmail, verifyPassword } from '@/lib/auth';
import { setSession } from '@/lib/session';
import { loginSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp, fail, ok } from '@/lib/http';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request body.');
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail('Enter your email and password.', 422);

  const email = normalizeEmail(parsed.data.email);

  // Rate-limit on IP + email to slow credential-stuffing.
  const limit = rateLimit(`login:${clientIp(request)}:${email}`, 8, 10 * 60 * 1000);
  if (!limit.ok) return fail('Too many attempts. Try again later.', 429);

  const user = await prisma.user.findUnique({ where: { email } });
  // Same generic message whether the email or password is wrong.
  const invalid = () => fail('Incorrect email or password.', 401);

  if (!user) return invalid();
  if (user.banned) return fail('This account has been suspended.', 403);

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return invalid();

  await setSession(user.id);
  return ok({ ok: true, user: { displayName: user.displayName, role: user.role } });
}
