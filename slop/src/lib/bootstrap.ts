import 'server-only';
import { prisma } from './db';
import { hashPassword, normalizeEmail, verifyPassword } from './auth';

let ran = false;

/**
 * Reconcile the single super-admin account from environment variables. Runs
 * once per server process (via instrumentation). The env credentials are the
 * source of truth: changing SUPER_ADMIN_PASSWORD and redeploying rotates it.
 */
export async function ensureSuperAdmin(): Promise<void> {
  if (ran) return;
  ran = true;

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    console.warn(
      '[bootstrap] SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not set — no super admin will exist.',
    );
    return;
  }

  const normalized = normalizeEmail(email);

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalized } });

    if (existing) {
      const passwordMatches = await verifyPassword(password, existing.passwordHash);
      const needsUpdate =
        existing.role !== 'SUPER_ADMIN' ||
        existing.banned ||
        existing.displayName !== name ||
        !passwordMatches;

      if (needsUpdate) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            role: 'SUPER_ADMIN',
            banned: false,
            displayName: name,
            ...(passwordMatches ? {} : { passwordHash: await hashPassword(password) }),
          },
        });
        console.log('[bootstrap] Super admin account reconciled.');
      }
    } else {
      await prisma.user.create({
        data: {
          email: normalized,
          displayName: name,
          passwordHash: await hashPassword(password),
          role: 'SUPER_ADMIN',
        },
      });
      console.log('[bootstrap] Super admin account created.');
    }
  } catch (err) {
    // Don't crash the server if the DB isn't reachable yet — log and move on.
    console.error('[bootstrap] Failed to reconcile super admin:', err);
  }
}
