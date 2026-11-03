import type { Due, Payment } from '@/lib/types';
import { PayButton } from '@/components/features/pay-button';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TONE: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  SUCCESS: 'bg-green-100 text-green-800',
  UNPAID: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  OVERDUE: 'bg-red-100 text-red-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

const money = (amount: string) => `৳${Number(amount).toLocaleString('en-US')}`;
const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const monthLabel = (m: number, y: number) => `${MONTH_NAMES[m - 1] ?? m} ${y}`;

const TH = 'px-4 py-3 text-left font-medium text-muted-foreground';
const TD = 'px-4 py-3';

function Empty({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-muted-foreground">{text}</td>
    </tr>
  );
}

export function DuesTable({ dues, showMember, payable }: { dues: Due[]; showMember?: boolean; payable?: boolean }) {
  const withMember = showMember ?? dues.some((d) => d.member);
  const cols = (withMember ? 5 : 4) + (payable ? 1 : 0);
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {withMember && <th className={TH}>Member</th>}
            <th className={TH}>Month</th>
            <th className={TH}>Amount</th>
            <th className={TH}>Due date</th>
            <th className={TH}>Status</th>
            {payable && <th className={TH}>Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {dues.length === 0 && <Empty cols={cols} text="No dues found." />}
          {dues.map((d) => (
            <tr key={d.id}>
              {withMember && (
                <td className={TD}>
                  <div className="font-medium">{d.member?.user.name ?? '-'}</div>
                  <div className="text-xs text-muted-foreground">{d.member?.studentIdNo}</div>
                </td>
              )}
              <td className={TD}>{monthLabel(d.month, d.year)}</td>
              <td className={TD}>{money(d.amount)}</td>
              <td className={TD}>{day(d.dueDate)}</td>
              <td className={TD}><Badge status={d.status} /></td>
              {payable && (
                <td className={TD}>{d.status !== 'PAID' ? <PayButton dueId={d.id} /> : null}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PaymentsTable({ payments, showUser }: { payments: Payment[]; showUser?: boolean }) {
  const withUser = showUser ?? true;
  const cols = withUser ? 6 : 5;
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {withUser && <th className={TH}>User</th>}
            <th className={TH}>Purpose</th>
            <th className={TH}>Amount</th>
            <th className={TH}>Transaction ID</th>
            <th className={TH}>Date</th>
            <th className={TH}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {payments.length === 0 && <Empty cols={cols} text="No payments found." />}
          {payments.map((p) => (
            <tr key={p.id}>
              {withUser && <td className={TD}>{p.user.name}</td>}
              <td className={TD}>
                {p.purpose}
                {p.due && <div className="text-xs text-muted-foreground">{monthLabel(p.due.month, p.due.year)}</div>}
              </td>
              <td className={TD}>{money(p.amount)}</td>
              <td className={`${TD} font-mono text-xs`}>{p.transactionId ?? '-'}</td>
              <td className={TD}>{day(p.createdAt)}</td>
              <td className={TD}><Badge status={p.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}