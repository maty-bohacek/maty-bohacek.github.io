import 'server-only';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/** Is this the reserved super-admin email (governed by env, not registration)? */
export function isSuperAdminEmail(email: string): boolean {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  return !!adminEmail && normalizeEmail(email) === normalizeEmail(adminEmail);
}
