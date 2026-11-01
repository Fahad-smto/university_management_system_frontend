import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { MemberCard } from '@/components/features/cards';
import { api } from '@/lib/api';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { PublicMember } from '@/lib/types';

export const metadata: Metadata = { title: 'Member directory' };

// Rendered on the server for every request: moderators and admins also see phone numbers,
// so this page uses the visitor's login and is never shared from a cache.
export default async function MembersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);

  const result = await api<PublicMember[]>('/members/public', {
    query: {
      page: pageOf(params),
      limit: 12,
      searchTerm: params.searchTerm,
      session: params.session,
      class: params.class,
      sortBy: 'joinedAt',
      sortOrder: 'desc',
    },
  });

  return (
    <Container className="space-y-8 py-12">
      <PageHeader title="Member directory" description="Meet the active members of the organization." />

      <SearchFilters
        current={params}
        fields={[
          { name: 'searchTerm', type: 'search', placeholder: 'Search by name or student ID…' },
          { name: 'session', type: 'search', placeholder: 'Session, e.g. 2023-24' },
          { name: 'class', type: 'search', placeholder: 'Class' },
        ]}
      />

      {!result.success ? (
        <EmptyState icon={Users} title="Could not load members" description={result.message} />
      ) : result.data.length === 0 ? (
        <EmptyState icon={Users} title="No members found" description="Try a different search." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.data.map((member) => <MemberCard key={member.id} member={member} />)}
          </div>
          <Pagination meta={result.meta} basePath="/members" params={params} />
        </>
      )}
    </Container>
  );
}
