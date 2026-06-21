import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import type { User, UserRole } from '@prisma/client';
import { prisma } from './db';
import { atLeast } from './roles';

const COOKIE_NAME = 'slop_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = Omit<User, 'passwordHash'>;

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set a long random string in the environment.',
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Write the session cookie (call from a route handler or server action). */
export async function setSession(userId: string): Promise<void> {
  const token = await createSessionToken(userId);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * Resolve the currently logged-in user, or null. Always reads the user fresh
 * from the database so role changes and bans take effect immediately. Banned
 * users are treated as logged out.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const userId = await verifySessionToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.banned) return null;

  const { passwordHash: _omit, ...safe } = user;
  void _omit;
  return safe;
}

/** For server components: require a logged-in user or redirect to login. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const next = returnTo ? `?next=${encodeURIComponent(returnTo)}` : '';
    redirect(`/login${next}`);
  }
  return user;
}

/** For server components: require a minimum role or redirect. */
export async function requireRole(min: UserRole, returnTo?: string): Promise<SessionUser> {
  const user = await requireUser(returnTo);
  if (!atLeast(user.role, min)) {
    redirect('/');
  }
  return user;
}
