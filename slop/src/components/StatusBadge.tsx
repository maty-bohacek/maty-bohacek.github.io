import type { SubmissionStatus } from '@prisma/client';

const MAP: Record<SubmissionStatus, { cls: string; label: string }> = {
  PENDING: { cls: 'badge-pending', label: 'Pending review' },
  APPROVED: { cls: 'badge-approved', label: 'Live' },
  REJECTED: { cls: 'badge-rejected', label: 'Rejected' },
};

export default function StatusBadge({ status }: { status: SubmissionStatus }) {
  const { cls, label } = MAP[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
