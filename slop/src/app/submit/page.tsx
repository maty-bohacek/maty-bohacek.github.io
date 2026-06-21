import type { Metadata } from 'next';
import { requireUser } from '@/lib/session';
import { canPublishDirectly } from '@/lib/roles';
import SubmitForm from '@/components/SubmitForm';

export const metadata: Metadata = { title: 'Submit a sighting' };
export const dynamic = 'force-dynamic';

export default async function SubmitPage() {
  const user = await requireUser('/submit');

  return (
    <div className="site-container py-10 md:py-14">
      <header className="mb-8">
        <h1 className="text-display-sm text-neutral-900">Submit a sighting</h1>
        <p className="mt-2 font-ui text-sm text-neutral-600">
          Spotted AI slop in the wild? Add it to the map.
        </p>
      </header>
      <SubmitForm autoPublish={canPublishDirectly(user.role)} />
    </div>
  );
}
