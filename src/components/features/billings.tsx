import { Receipt, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionButton } from '@/components/shared/action-button';
import { EmptyState } from '@/components/shared/common';
import { StatusBadge } from '@/components/shared/status-badge';
import { PayButton } from '@/components/features/pay-button';
import { verifyPaymentAction } from '@/actions/payment';
import { formatDate, formatDateTime, formatMoney, monthLabel } from '@/lib/format';
import type { Due, Payment } from '@/lib/types';

export function DuesTable({ dues, showMember, payable }: { dues: Due[]; showMember?: boolean; payable?: boolean }) {
  if (dues.length === 0) {
    return <EmptyState icon={Receipt} title="No dues found" description="Monthly dues will appear here once they are generated." />;
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Month</TableHead>
            {showMember ? <TableHead>Member</TableHead> : null}
            <TableHead>Amount</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Status</TableHead>
            {payable ? <TableHead className="text-right">Action</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dues.map((due) => (
            <TableRow key={due.id}>
              <TableCell className="font-medium">{monthLabel(due.month, due.year)}</TableCell>
              {showMember ? (
                <TableCell>
                  <p className="font-medium">{due.member?.user.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">ID {due.member?.studentIdNo ?? '—'}</p>
                </TableCell>
              ) : null}
              <TableCell className="font-semibold">{formatMoney(due.amount)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(due.dueDate)}</TableCell>
              <TableCell><StatusBadge status={due.status} /></TableCell>
              {payable ? (
                <TableCell className="text-right">
                  {due.status === 'PAID' ? <span className="text-xs text-muted-foreground">Paid</span> : <PayButton dueId={due.id} />}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function PaymentsTable({
  payments,
  showUser,
  canVerify,
}: {
  payments: Payment[];
  showUser?: boolean;
  canVerify?: boolean;
}) {
  if (payments.length === 0) {
    return <EmptyState icon={Wallet} title="No payments yet" description="Your bKash payments will be listed here." />;
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Date</TableHead>
            {showUser ? <TableHead>Member</TableHead> : null}
            <TableHead>For</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>bKash trxID</TableHead>
            {canVerify ? <TableHead className="text-right">Action</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(payment.createdAt)}</TableCell>
              {showUser ? <TableCell className="font-medium">{payment.user.name}</TableCell> : null}
              <TableCell>{payment.due ? monthLabel(payment.due.month, payment.due.year) : 'Membership fee'}</TableCell>
              <TableCell className="font-semibold">{formatMoney(payment.amount)}</TableCell>
              <TableCell><StatusBadge status={payment.status} /></TableCell>
              <TableCell className="font-mono text-xs">{payment.transactionId ?? '—'}</TableCell>
              {canVerify ? (
                <TableCell className="text-right">
                  {payment.status === 'PENDING' ? (
                    <ActionButton action={verifyPaymentAction} args={[payment.id]}>Check status</ActionButton>
                  ) : null}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
