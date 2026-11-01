import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, GraduationCap, Hash, Layers, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/avatar';
import { Container } from '@/components/shared/container';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { PublicMember } from '@/lib/types';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: 'Member' };

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await api<PublicMember>(`/members/public/${id}`);
  if (!result.success) notFound();

  const member = result.data;
  const rows = [
    { icon: GraduationCap, label: 'Class', value: member.class },
    { icon: CalendarDays, label: 'Session', value: member.session },
    { icon: Hash, label: 'Student ID', value: member.studentIdNo },
    { icon: Layers, label: 'Section', value: member.section?.name ?? 'Not assigned' },
    { icon: CalendarDays, label: 'Member since', value: formatDate(member.joinedAt) },
  ];

  return (
    <Container className="max-w-2xl space-y-6 py-12">
      <Button asChild variant="ghost" size="sm">
        <Link href="/members"><ArrowLeft /> Member directory</Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="hero-gradient h-28 border-b bg-primary/5" />
        <div className="space-y-6 p-6 pt-0 sm:p-8 sm:pt-0">
          <div className="-mt-12 flex items-end gap-4">
            <UserAvatar name={member.user.name} src={member.user.profileImage} className="size-24 border-4 border-card text-2xl" />
            <div className="pb-1">
              <h1 className="text-2xl font-bold tracking-tight">{member.user.name}</h1>
              <p className="text-sm text-muted-foreground">Active member</p>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3.5">
                <row.icon className="size-4 text-primary" />
                <div>
                  <dt className="text-xs text-muted-foreground">{row.label}</dt>
                  <dd className="text-sm font-medium">{row.value}</dd>
                </div>
              </div>
            ))}
            {member.user.phone ? (
              <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-3.5 sm:col-span-2">
                <Phone className="size-4 text-primary" />
                <div>
                  <dt className="text-xs text-muted-foreground">Phone (visible to staff only)</dt>
                  <dd className="text-sm font-medium">{member.user.phone}</dd>
                </div>
              </div>
            ) : null}
          </dl>
        </div>
      </Card>
    </Container>
  );
}
