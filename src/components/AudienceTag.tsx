import { SpeakingAudience } from '@/types';

export const AUDIENCE_LABELS: Record<SpeakingAudience, string> = {
  industry: 'Industry',
  academic: 'Academia',
};

// Same chip shape as the type labels on upcoming events.
const styles: Record<SpeakingAudience, string> = {
  industry: 'bg-swiss-blue/10 text-swiss-blue',
  academic: 'bg-primary-100 text-primary-700',
};

export default function AudienceTag({ audience }: { audience: SpeakingAudience }) {
  return (
    <span className={`whitespace-nowrap text-xs font-semibold font-ui px-1.5 py-0.5 ${styles[audience]}`}>
      {AUDIENCE_LABELS[audience]}
    </span>
  );
}
