import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = { title: 'Log in' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(next && next.startsWith('/') ? next : '/');

  return (
    <div className="site-container py-12 md:py-16">
      <LoginForm next={next} />
    </div>
  );
}
