import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Banknote, CalendarDays, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/shared/container';
import { StatusBadge } from '@/components/shared/status-badge';
import { RegisterEventButton } from '@/components/features/register-event-button';
import { api } from '@/lib/api';
import { formatDateTime, formatMoney } from '@/lib/format';
import type { EventItem } from '@/lib/types';

// Static page per event (SSG + ISR). Seats update every minute and instantly after a registration.
export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const result = await api<EventItem[]>('/events', { auth: false, revalidate: 300, query: { limit: 20 } });
  return result.success ? result.data.map((event) => ({ id: event.id })) : [];
}

async function getEvent(id: string) {
  const result = await api<EventItem>(`/events/${id}`, { auth: false, revalidate: 60 });
  return result.success ? result.data : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  return { title: event?.title ?? 'Event', description: event?.description ?? undefined };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const isFree = Number(event.fee) === 0;
  const percent = event.capacity ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100)) : 0;

  let closedReason: string | undefined;
  if (event.status !== 'UPCOMING') closedReason = 'Registration is closed';
  else if (event.seatsLeft === 0) closedReason = 'This event is full';

  return (
    <Container className="space-y-8 py-12">
      <Button asChild variant="ghost" size="sm">
        <Link href="/events"><ArrowLeft /> All events</Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <StatusBadge status={event.status} />
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{event.title}</h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="flex items-center gap-3 p-4">
              <CalendarDays className="size-5 text-primary" />
              <div><p className="text-xs text-muted-foreground">When</p><p className="text-sm font-medium">{formatDateTime(event.eventDate)}</p></div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <MapPin className="size-5 text-primary" />
              <div><p className="text-xs text-muted-foreground">Where</p><p className="text-sm font-medium">{event.venue}</p></div>
            </Card>
          </div>

          <div className="space-y-3 rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">About this event</h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {event.description || 'More details will be shared soon.'}
            </p>
          </div>
        </div>

        <aside>
          <Card className="sticky top-24 space-y-5 p-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Banknote className="size-4" />Entry fee</span>
              <span className="text-2xl font-bold">{isFree ? 'Free' : formatMoney(event.fee)}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Users className="size-4" />Registered</span>
                <span className="font-medium">
                  {event.registeredCount}{event.capacity ? ` / ${event.capacity}` : ''}
                </span>
              </div>
              {event.capacity ? (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {event.seatsLeft === null ? 'Open registration, no seat limit.' : `${event.seatsLeft} seats left.`}
              </p>
            </div>

            <RegisterEventButton eventId={event.id} closedReason={closedReason} />
            <p className="text-center text-xs text-muted-foreground">Only active members can register.</p>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
