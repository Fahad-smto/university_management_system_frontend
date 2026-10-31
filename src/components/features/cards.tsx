import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock, MapPin, Phone, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/shared/status-badge';
import { excerpt, formatDate, formatDateTime, formatMoney } from '@/lib/format';
import type { EventItem, Notice, PublicMember } from '@/lib/types';

export function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <Link href={`/notices/${notice.id}`} className="group block h-full">
      <Card className="flex h-full flex-col gap-3 p-5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={notice.category} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {formatDate(notice.publishedAt)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight">{notice.title}</h3>
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{excerpt(notice.content, 160)}</p>
        <span className="flex items-center gap-1 text-sm font-medium text-primary">
          Read notice <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
      </Card>
    </Link>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  const date = new Date(event.eventDate);
  const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit', timeZone: 'Asia/Dhaka' }).format(date);
  const month = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'Asia/Dhaka' }).format(date);
  const percent = event.capacity ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100)) : 0;
  const isFree = Number(event.fee) === 0;

  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <Card className="flex h-full flex-col gap-4 p-5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="text-xl font-bold leading-none">{day}</span>
            <span className="text-[11px] font-semibold uppercase">{month}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <StatusBadge status={event.status} />
              <span className="text-sm font-semibold">{isFree ? 'Free' : formatMoney(event.fee)}</span>
            </div>
            <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight">{event.title}</h3>
          </div>
        </div>

        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><CalendarDays className="size-4 shrink-0" />{formatDateTime(event.eventDate)}</li>
          <li className="flex items-center gap-2"><MapPin className="size-4 shrink-0" /><span className="truncate">{event.venue}</span></li>
        </ul>

        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="size-3.5" />{event.registeredCount} registered</span>
            <span>{event.seatsLeft === null ? 'Open seats' : `${event.seatsLeft} seats left`}</span>
          </div>
          {event.capacity ? (
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}

export function MemberCard({ member }: { member: PublicMember }) {
  return (
    <Link href={`/members/${member.id}`} className="group block">
      <Card className="flex items-center gap-4 p-4 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
        <UserAvatar name={member.user.name} src={member.user.profileImage} className="size-14" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{member.user.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {member.class} · {member.session}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>ID {member.studentIdNo}</span>
            {member.section ? <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">{member.section.name}</span> : null}
            {member.user.phone ? (
              <span className="flex items-center gap-1 text-foreground"><Phone className="size-3" />{member.user.phone}</span>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
