import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Megaphone,
  MapPin,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/shared/container';
import { EmptyState, IconTile, SectionHeading } from '@/components/shared/common';
import { StatusBadge } from '@/components/shared/status-badge';
import { EventCard, NoticeCard } from '@/components/features/cards';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { EventItem, Notice } from '@/lib/types';

// Static page that refreshes itself every minute (ISR): fast for everyone, always reasonably fresh
export const revalidate = 60;

const features = [
  { icon: BadgeCheck, tone: 'primary', title: 'Easy membership', text: 'Create your member profile in a minute and get approved by a moderator.' },
  { icon: CalendarDays, tone: 'info', title: 'Events and seats', text: 'Browse upcoming programs and reserve your seat before it fills up.' },
  { icon: Megaphone, tone: 'warning', title: 'Official notices', text: 'Every announcement from the committee, searchable and always in one place.' },
  { icon: Wallet, tone: 'success', title: 'Pay with bKash', text: 'See your monthly dues and pay them securely from your phone.' },
] as const;

export default async function HomePage() {
  const [notices, events] = await Promise.all([
    api<Notice[]>('/notices', { auth: false, revalidate: 60, query: { limit: 3 } }),
    api<EventItem[]>('/events', {
      auth: false,
      revalidate: 60,
      query: { status: 'UPCOMING', limit: 3, sortBy: 'eventDate', sortOrder: 'asc' },
    }),
  ]);

  const noticeList = notices.success ? notices.data : [];
  const eventList = events.success ? events.data : [];
  const nextEvent = eventList[0];

  return (
    <>
      <section className="hero-gradient relative overflow-hidden border-b">
        <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium shadow-xs">
              <Sparkles className="size-3.5 text-primary" /> Student organization portal
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Your college community, <span className="text-primary">beautifully organized.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Join the organization, follow every notice, reserve seats at events and pay your monthly fee, all from one
              simple place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">Become a member <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/events">Explore events</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" />
            <Card className="glass space-y-5 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Next event</p>
                {nextEvent ? <StatusBadge status={nextEvent.status} /> : null}
              </div>
              {nextEvent ? (
                <>
                  <h3 className="text-2xl font-bold leading-snug tracking-tight">{nextEvent.title}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CalendarDays className="size-4" />{formatDateTime(nextEvent.eventDate)}</li>
                    <li className="flex items-center gap-2"><MapPin className="size-4" />{nextEvent.venue}</li>
                  </ul>
                  <Button asChild className="w-full">
                    <Link href={`/events/${nextEvent.id}`}>View details <ArrowRight /></Link>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">New events will appear here as soon as the committee publishes them.</p>
              )}
            </Card>
          </div>
        </Container>
      </section>

      <Container className="py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="space-y-3 p-6">
              <IconTile icon={feature.icon} tone={feature.tone} />
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.text}</p>
            </Card>
          ))}
        </div>
      </Container>

      <Container className="space-y-8 pb-4">
        <SectionHeading
          eyebrow="Latest"
          title="Notices"
          description="The newest announcements from the committee."
          action={<Button asChild variant="ghost"><Link href="/notices">All notices <ArrowRight /></Link></Button>}
        />
        {noticeList.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {noticeList.map((notice) => <NoticeCard key={notice.id} notice={notice} />)}
          </div>
        ) : (
          <EmptyState icon={Megaphone} title="No notices yet" description="Announcements will show up here." />
        )}
      </Container>

      <Container className="space-y-8 py-16">
        <SectionHeading
          eyebrow="Coming up"
          title="Upcoming events"
          description="Reserve your seat before it is gone."
          action={<Button asChild variant="ghost"><Link href="/events">All events <ArrowRight /></Link></Button>}
        />
        {eventList.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {eventList.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <EmptyState icon={CalendarDays} title="No upcoming events" description="Check back soon for the next program." />
        )}
      </Container>

      <Container>
        <div className="overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to join the organization?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Create your account, complete your member profile and you are in.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-7">
            <Link href="/register">Create my account <ArrowRight /></Link>
          </Button>
        </div>
      </Container>
    </>
  );
}
