import type { Metadata } from 'next';
import Link from 'next/link';
import { CircleAlert, CircleCheck, CircleX, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/shared/container';
import { api } from '@/lib/api';
import { formatMoney, monthLabel } from '@/lib/format';
import { readParams, type SearchParams } from '@/lib/search-params';
import type { Payment } from '@/lib/types';

export const metadata: Metadata = { title: 'Payment result' };
export const dynamic = 'force-dynamic';

// bKash sends the browser here after the payment (set BKASH_CALLBACK_URL on the backend to this page).
// We pass paymentID and status to the backend, which verifies the payment with bKash.
export default async function PaymentCallbackPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  const { paymentID, status } = params;

  if (!paymentID || !status) {
    return (
      <Container className="max-w-lg py-20">
        <Card className="space-y-4 p-8 text-center">
          <CircleAlert className="mx-auto size-12 text-warning" />
          <h1 className="text-2xl font-bold">Nothing to show</h1>
          <p className="text-muted-foreground">This page opens automatically after a bKash payment.</p>
          <Button asChild><Link href="/dashboard/dues">Go to my dues</Link></Button>
        </Card>
      </Container>
    );
  }

  const result = await api<Payment>('/payments/bkash/callback', { auth: false, query: { paymentID, status } });
  const payment = result.success ? result.data : null;

  const view = !payment
    ? { icon: CircleAlert, tone: 'text-warning', title: 'We could not confirm this payment', text: result.success ? '' : result.message }
    : payment.status === 'SUCCESS'
      ? { icon: CircleCheck, tone: 'text-success', title: 'Payment successful', text: 'Thank you! Your monthly fee has been paid.' }
      : payment.status === 'CANCELLED'
        ? { icon: CircleX, tone: 'text-muted-foreground', title: 'Payment cancelled', text: 'No money was taken. You can try again any time.' }
        : payment.status === 'PENDING'
          ? { icon: Clock, tone: 'text-warning', title: 'Payment is being processed', text: 'Please check your payments page in a moment.' }
          : { icon: CircleX, tone: 'text-destructive', title: 'Payment failed', text: 'The payment did not go through. You can try again.' };

  return (
    <Container className="max-w-lg py-20">
      <Card className="space-y-6 p-8 text-center">
        <view.icon className={`mx-auto size-14 ${view.tone}`} />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{view.title}</h1>
          {view.text ? <p className="text-muted-foreground">{view.text}</p> : null}
        </div>

        {payment ? (
          <dl className="space-y-3 rounded-xl bg-muted/60 p-4 text-left text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Amount</dt><dd className="font-semibold">{formatMoney(payment.amount)}</dd></div>
            {payment.due ? (
              <div className="flex justify-between"><dt className="text-muted-foreground">For</dt><dd className="font-medium">{monthLabel(payment.due.month, payment.due.year)}</dd></div>
            ) : null}
            {payment.transactionId ? (
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">bKash trxID</dt><dd className="font-mono font-medium">{payment.transactionId}</dd></div>
            ) : null}
          </dl>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild><Link href="/dashboard/payments">My payments</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard/dues">Monthly dues</Link></Button>
        </div>
      </Card>
    </Container>
  );
}
