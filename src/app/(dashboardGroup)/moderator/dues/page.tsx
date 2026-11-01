import type { Metadata } from 'next';
import { Receipt } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { DuesTable } from '@/components/features/tables';
import { api } from '@/lib/api';
import { MONTHS } from '@/lib/format';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { Due } from '@/lib/types';

export const metadata: Metadata = { title: 'All dues' };

export default async function ModeratorDuesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  const result = await api<Due[]>('/payments/dues', {
    query: { page: pageOf(params), limit: 15, status: params.status, month: params.month, year: params.year },
  });

  return (
    <>
      <PageHeader title="All dues" description="Who has paid their monthly fee and who is late." />

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
          {
            name: 'month',
            type: 'select',
            placeholder: 'Any month',
            options: MONTHS.map((month, index) => ({ label: month, value: String(index + 1) })),
          },
          { name: 'year', type: 'search', placeholder: 'Year, e.g. 2026' },
        ]}
      />

      {!result.success ? (
        <EmptyState icon={Receipt} title="Could not load dues" description={result.message} />
      ) : (
        <>
          <DuesTable dues={result.data} showMember />
          <Pagination meta={result.meta} basePath="/moderator/dues" params={params} />
        </>
      )}
    </>
  );
}
