import type { Metadata } from 'next';
import { Receipt } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { DuesTable } from '@/components/features/tables';
import { api } from '@/lib/api';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { Due } from '@/lib/types';

export const metadata: Metadata = { title: 'Monthly dues' };

export default async function MyDuesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  const result = await api<Due[]>('/payments/dues/my', {
    query: { page: pageOf(params), limit: 12, status: params.status },
  });

  return (
    <>
      <PageHeader title="Monthly dues" description="Pay your monthly fee securely with bKash." />

      <SearchFilters
        current={params}
        fields={[
          {
            name: 'status',
            type: 'select',
            placeholder: 'All statuses',
            options: [
              { label: 'Unpaid', value: 'UNPAID' },
              { label: 'Overdue', value: 'OVERDUE' },
              { label: 'Paid', value: 'PAID' },
            ],
          },
        ]}
      />

      {!result.success ? (
        <EmptyState
          icon={Receipt}
          title={result.status === 404 ? 'Create your member profile first' : 'Could not load your dues'}
          description={result.status === 404 ? 'Dues are created for active members. Complete your profile on the Profile page.' : result.message}
        />
      ) : (
        <>
          <DuesTable dues={result.data} payable />
          <Pagination meta={result.meta} basePath="/dashboard/dues" params={params} />
        </>
      )}
    </>
  );
}
