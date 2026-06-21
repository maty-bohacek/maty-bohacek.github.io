import type { UserRole } from '@prisma/client';

// Numeric rank for the capability ladder. Higher = more powerful.
const RANK: Record<UserRole, number> = {
  USER: 0,
  TRUSTED: 1,
  REVIEWER: 2,
  SUPER_ADMIN: 3,
};

export function atLeast(role: UserRole, min: UserRole): boolean {
  return RANK[role] >= RANK[min];
}

/** Can this role publish submissions immediately (skip the review queue)? */
export function canPublishDirectly(role: UserRole): boolean {
  return atLeast(role, 'TRUSTED');
}

/** Can this role approve/reject other people's submissions? */
export function canReview(role: UserRole): boolean {
  return atLeast(role, 'REVIEWER');
}

/** Can this role manage users (ban, change roles)? */
export function canManageUsers(role: UserRole): boolean {
  return atLeast(role, 'SUPER_ADMIN');
}

// Roles a super-admin may assign to ordinary users via the admin panel.
// SUPER_ADMIN is intentionally excluded — there is exactly one, and it is
// governed by environment variables, not the database.
export const ASSIGNABLE_ROLES: UserRole[] = ['USER', 'TRUSTED', 'REVIEWER'];

export const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'User',
  TRUSTED: 'Trusted',
  REVIEWER: 'Reviewer',
  SUPER_ADMIN: 'Super admin',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  USER: 'Submissions wait for review before appearing on the map.',
  TRUSTED: 'Submissions publish immediately, no review needed.',
  REVIEWER: 'Publishes immediately and can approve or reject others.',
  SUPER_ADMIN: 'Full control, including user management.',
};
