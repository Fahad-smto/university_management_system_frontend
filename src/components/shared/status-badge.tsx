import { Badge } from '@/components/ui/badge';
import { titleCase } from '@/lib/format';

type Tone = 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'default';

// One place that decides the colour of every status in the app
const TONES: Record<string, Tone> = {
  ACTIVE: 'success',
  SUCCESS: 'success',
  PAID: 'success',
  REGISTERED: 'success',
  COMPLETED: 'success',
  PENDING: 'warning',
  UNPAID: 'warning',
  UPCOMING: 'info',
  ONGOING: 'info',
  EVENT: 'info',
  GENERAL: 'secondary',
  ELECTION: 'default',
  INACTIVE: 'secondary',
  EXPIRED: 'secondary',
  CANCELLED: 'secondary',
  FAILED: 'destructive',
  OVERDUE: 'destructive',
  URGENT: 'destructive',
  BLOCKED: 'destructive',
  SUPER_ADMIN: 'destructive',
  ADMIN: 'default',
  MODERATOR: 'info',
  MEMBER: 'secondary',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={TONES[status] ?? 'secondary'} className={className}>
      {titleCase(status)}
    </Badge>
  );
}
