'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function safeNext(next?: string): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export default function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors({});

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      router.replace(safeNext(next));
      router.refresh();
      return;
    }
    setErrors(data.fields ?? {});
    setMessage(data.error ?? 'Something went wrong.');
    setLoading(false);
  }

  return (
    <div className="card p-6">
      <h1 className="text-display-sm text-neutral-900">Create an account</h1>
      <p className="mt-1 font-ui text-sm text-neutral-500">
        New accounts start as <strong>users</strong> — your submissions are reviewed before they
        appear on the map.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {message && <div className="alert alert-error">{message}</div>}

        <div>
          <label className="label" htmlFor="displayName">
            Display name
          </label>
          <input
            id="displayName"
            className="input"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder="How you'll be credited"
            autoComplete="name"
            required
          />
          {errors.displayName && <p className="field-error">{errors.displayName}</p>}
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            required
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
            required
          />
          {errors.password ? (
            <p className="field-error">{errors.password}</p>
          ) : (
            <p className="hint">At least 8 characters.</p>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 font-ui text-sm text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
