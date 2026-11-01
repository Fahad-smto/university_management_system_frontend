import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import { Container } from '@/components/shared/container';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { EventCard } from '@/components/features/cards';
import { api } from '@/lib/api';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { EventItem } from '@/lib/types';

export const metadata: Metadata = { title: 'Events' };

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);

  // Upcoming events are shown by default. "ALL" removes the status filter.
  const status = params.status === 'ALL' ? undefined : (params.status ?? 'UPCOMING');
  const sortOrder = !status || status === 'COMPLETED' || status === 'CANCELLED' ? 'desc' : 'asc';

  const result = await api<EventItem[]>('/events', {
    auth: false,
    revalidate: 60,
    query: { page: pageOf(params), limit: 9, searchTerm: params.searchTerm, status, sortBy: 'eventDate', sortOrder },
  });

  return (
    <Container className="space-y-8 py-12">
      <PageHeader title="Events" description="Programs, meetups and celebrations organized by the committee." />

      <SearchFilters
        current={params}
        fields={[
          { name: 'searchTerm', type: 'search', placeholder: 'Search events…' },
          {
            name: 'status',
            type: 'select',
            placeholder: 'Upcoming',
            options: [
              { label: 'Ongoing', value: 'ONGOING' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
              { label: 'All events', value: 'ALL' },
            ],
          },
        ]}
      />

      {!result.success ? (
        <EmptyState icon={CalendarDays} title="Could not load events" description={result.message} />
      ) : result.data.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No events found" description="Try a different search or filter." />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {result.data.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
          <Pagination meta={result.meta} basePath="/events" params={params} />
        </>
      )}
    </Container>
  );
}
