import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/shared/container';
import { StatusBadge } from '@/components/shared/status-badge';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { Notice } from '@/lib/types';

// Static page per notice (SSG + ISR): pre-built for the latest notices, built on demand for the rest
export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const result = await api<Notice[]>('/notices', { auth: false, revalidate: 300, query: { limit: 20 } });
  return result.success ? result.data.map((notice) => ({ id: notice.id })) : [];
}

async function getNotice(id: string) {
  const result = await api<Notice>(`/notices/${id}`, { auth: false, revalidate: 60 });
  return result.success ? result.data : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const notice = await getNotice(id);
  return { title: notice?.title ?? 'Notice', description: notice?.content.slice(0, 150) };
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const notice = await getNotice(id);
  if (!notice) notFound();

  return (
    <Container className="max-w-3xl space-y-8 py-12">
      <Button asChild variant="ghost" size="sm">
        <Link href="/notices"><ArrowLeft /> All notices</Link>
      </Button>

      <article className="space-y-6">
        <header className="space-y-4">
          <StatusBadge status={notice.category} />
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{notice.title}</h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="size-4" />{formatDateTime(notice.publishedAt)}</span>
            {notice.createdBy ? <span className="flex items-center gap-1.5"><UserRound className="size-4" />{notice.createdBy.name}</span> : null}
          </div>
        </header>
        <div className="whitespace-pre-line rounded-2xl border bg-card p-6 text-base leading-relaxed sm:p-8">
          {notice.content}
        </div>
      </article>
    </Container>
  );
}
