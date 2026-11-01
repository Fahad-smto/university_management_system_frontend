import type { Metadata } from 'next';
import { CreditCard } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { PaymentsTable } from '@/components/features/tables';
import { api } from '@/lib/api';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { Payment } from '@/lib/types';

export const metadata: Metadata = { title: 'All payments' };

export default async function AdminPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  const result = await api<Payment[]>('/payments', {
    query: { page: pageOf(params), limit: 15, status: params.status, userId: params.userId },
  });

  return (
    <>
      <PageHeader title="All payments" description="Every bKash payment made by members." />

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
        <EmptyState icon={CreditCard} title="Could not load payments" description={result.message} />
      ) : (
        <>
          <PaymentsTable payments={result.data} showUser />
          <Pagination meta={result.meta} basePath="/admin/payments" params={params} />
        </>
      )}
    </>
  );
}
