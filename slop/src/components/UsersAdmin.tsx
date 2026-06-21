'use client';

import { useState } from 'react';
import type { UserRole } from '@prisma/client';
import { ASSIGNABLE_ROLES, ROLE_LABELS } from '@/lib/roles';

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  banned: boolean;
  createdAt: string;
  submissions: number;
};

export default function UsersAdmin({ users: initial }: { users: AdminUser[] }) {
  const [users, setUsers] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  async function update(id: string, patch: { role?: UserRole; banned?: boolean }) {
    setBusy(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));
      } else {
        setError(data.error ?? 'Update failed.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setBusy(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      !query ||
      u.displayName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      {error && <div className="alert alert-error mb-4">{error}</div>}

      <input
        className="input mb-4 max-w-sm"
        placeholder="Search by name or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left font-ui text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Submissions</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filtered.map((u) => {
              const isSuper = u.role === 'SUPER_ADMIN';
              return (
                <tr key={u.id} className={u.banned ? 'bg-red-50/40' : undefined}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-900">{u.displayName}</div>
                    <div className="text-xs text-neutral-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {isSuper ? (
                      <span className="badge badge-approved">{ROLE_LABELS.SUPER_ADMIN}</span>
                    ) : (
                      <select
                        className="select max-w-[140px]"
                        value={u.role}
                        disabled={busy === u.id}
                        onChange={(e) => update(u.id, { role: e.target.value as UserRole })}
                      >
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{u.submissions}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {u.banned ? (
                      <span className="badge badge-rejected">Banned</span>
                    ) : (
                      <span className="badge badge-neutral">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isSuper ? (
                      <span className="text-xs text-neutral-400">—</span>
                    ) : u.banned ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={busy === u.id}
                        onClick={() => update(u.id, { banned: false })}
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={busy === u.id}
                        onClick={() => update(u.id, { banned: true })}
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center font-ui text-sm text-neutral-400">No users match.</p>
      )}
    </div>
  );
}
