import type { Metadata } from 'next';
import { Wallet } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { PaymentsTable } from '@/components/features/tables';
import { api } from '@/lib/api';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { Payment } from '@/lib/types';

export const metadata: Metadata = { title: 'My payments' };

export default async function MyPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  const result = await api<Payment[]>('/payments/my', {
    query: { page: pageOf(params), limit: 12, status: params.status },
  });

  return (
    <>
      <PageHeader title="My payments" description="Your bKash payment history. A pending payment can be checked with bKash." />

      <SearchFilters
        current={params}
        fields={[
          {
            name: 'status',
            type: 'select',
            placeholder: 'All statuses',
            options: [
              { label: 'Success', value: 'SUCCESS' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Failed', value: 'FAILED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ],
          },
        ]}
      />

      {!result.success ? (
        <EmptyState icon={Wallet} title="Could not load your payments" description={result.message} />
      ) : (
        <>
          <PaymentsTable payments={result.data} />
          <Pagination meta={result.meta} basePath="/dashboard/payments" params={params} />
        </>
      )}
    </>
  );
}
