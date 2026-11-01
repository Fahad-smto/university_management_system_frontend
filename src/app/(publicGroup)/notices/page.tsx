import type { Metadata } from 'next';
import { Megaphone } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { NoticeCard } from '@/components/features/cards';
import { api } from '@/lib/api';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { Notice } from '@/lib/types';

export const metadata: Metadata = { title: 'Notices' };

export default async function NoticesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);

  // public data, cached for a minute per filter combination
  const result = await api<Notice[]>('/notices', {
    auth: false,
    revalidate: 60,
    query: { page: pageOf(params), limit: 9, searchTerm: params.searchTerm, category: params.category },
  });

  return (
    <Container className="space-y-8 py-12">
      <PageHeader title="Notices" description="Official announcements from the organization." />

      <SearchFilters
        current={params}
        fields={[
          { name: 'searchTerm', type: 'search', placeholder: 'Search notices…' },
          {
            name: 'category',
            type: 'select',
            placeholder: 'All categories',
            options: [
              { label: 'General', value: 'GENERAL' },
              { label: 'Event', value: 'EVENT' },
              { label: 'Election', value: 'ELECTION' },
              { label: 'Urgent', value: 'URGENT' },
            ],
          },
        ]}
      />

      {!result.success ? (
        <EmptyState icon={Megaphone} title="Could not load notices" description={result.message} />
      ) : result.data.length === 0 ? (
        <EmptyState icon={Megaphone} title="No notices found" description="Try a different search or category." />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {result.data.map((notice) => <NoticeCard key={notice.id} notice={notice} />)}
          </div>
          <Pagination meta={result.meta} basePath="/notices" params={params} />
        </>
      )}
    </Container>
  );
}
