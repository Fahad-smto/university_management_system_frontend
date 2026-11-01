import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { StatusBadge } from '@/components/shared/status-badge';
import { EventFormDialog, EventRowActions } from '@/components/features/event-actions';
import { api } from '@/lib/api';
import { formatDateTime, formatMoney } from '@/lib/format';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { EventItem } from '@/lib/types';

export const metadata: Metadata = { title: 'Manage events' };

export default async function ModeratorEventsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  const result = await api<EventItem[]>('/events', {
    query: { page: pageOf(params), limit: 10, searchTerm: params.searchTerm, status: params.status, sortBy: 'eventDate', sortOrder: 'desc' },
  });

  return (
    <>
      <PageHeader
        title="Events"
        description="Create events, update their status and see who registered."
        actions={<EventFormDialog trigger={<Button><Plus /> New event</Button>} />}
      />

      <SearchFilters
        current={params}
        fields={[
          { name: 'searchTerm', type: 'search', placeholder: 'Search events…' },
          {
            name: 'status',
            type: 'select',
            placeholder: 'All statuses',
            options: [
              { label: 'Upcoming', value: 'UPCOMING' },
              { label: 'Ongoing', value: 'ONGOING' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ],
          },
        ]}
      />

      {!result.success ? (
        <EmptyState icon={CalendarDays} title="Could not load events" description={result.message} />
      ) : result.data.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No events found" description="Create the first event with the button above." />
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Event</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Link href={`/moderator/events/${event.id}`} className="font-medium hover:text-primary hover:underline">{event.title}</Link>
                      <p className="text-xs text-muted-foreground">{event.venue}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(event.eventDate)}</TableCell>
                    <TableCell>{Number(event.fee) === 0 ? 'Free' : formatMoney(event.fee)}</TableCell>
                    <TableCell>{event.registeredCount}{event.capacity ? ` / ${event.capacity}` : ''}</TableCell>
                    <TableCell><StatusBadge status={event.status} /></TableCell>
                    <TableCell className="text-right"><EventRowActions event={event} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Pagination meta={result.meta} basePath="/moderator/events" params={params} />
        </>
      )}
    </>
  );
}
