import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { StatusBadge } from '@/components/shared/status-badge';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { EventItem, StaffRegistration } from '@/lib/types';

export const metadata: Metadata = { title: 'Event registrations' };

type Props = { params: Promise<{ id: string }>; searchParams: SearchParams };

export default async function EventRegistrationsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await readParams(searchParams);

  const [event, registrations] = await Promise.all([
    api<EventItem>(`/events/${id}`),
    api<StaffRegistration[]>(`/events/${id}/registrations`, {
      query: { page: pageOf(query), limit: 15, status: query.status },
    }),
  ]);

  if (!event.success) notFound();

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-mb-4 w-fit">
        <Link href="/moderator/events"><ArrowLeft /> All events</Link>
      </Button>

      <PageHeader title={event.data.title} description="Who registered for this event." actions={<StatusBadge status={event.data.status} />} />

      <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><CalendarDays className="size-4" />{formatDateTime(event.data.eventDate)}</span>
        <span className="flex items-center gap-2"><MapPin className="size-4" />{event.data.venue}</span>
        <span className="flex items-center gap-2">
          <Users className="size-4" />{event.data.registeredCount}{event.data.capacity ? ` of ${event.data.capacity}` : ''} registered
        </span>
      </div>

      <SearchFilters
        current={query}
        fields={[
          {
            name: 'status',
            type: 'select',
            placeholder: 'Registered',
            options: [{ label: 'Cancelled', value: 'CANCELLED' }],
          },
        ]}
      />

      {!registrations.success ? (
        <EmptyState icon={Users} title="Could not load registrations" description={registrations.message} />
      ) : registrations.data.length === 0 ? (
        <EmptyState icon={Users} title="No registrations" description="Nobody has registered yet." />
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Member</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.user.memberProfile?.studentIdNo ?? '—'}</TableCell>
                    <TableCell>{item.user.memberProfile ? `${item.user.memberProfile.class} · ${item.user.memberProfile.session}` : '—'}</TableCell>
                    <TableCell>{item.user.phone ?? '—'}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(item.registeredAt)}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Pagination meta={registrations.meta} basePath={`/moderator/events/${id}`} params={query} />
        </>
      )}
    </>
  );
}
