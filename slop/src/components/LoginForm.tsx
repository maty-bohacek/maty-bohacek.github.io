'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function safeNext(next?: string): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/login', {
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
    setMessage(data.error ?? 'Could not log in.');
    setLoading(false);
  }

  return (
    <div className="card p-6">
      <h1 className="text-display-sm text-neutral-900">Log in</h1>
      <p className="mt-1 font-ui text-sm text-neutral-500">
        Welcome back. Log in to submit sightings and track their status.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {message && <div className="alert alert-error">{message}</div>}

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
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 font-ui text-sm text-neutral-500">
        No account yet?{' '}
        <Link href="/register" className="text-primary-600 underline">
          Register
        </Link>
      </p>
    </div>
  );
}
