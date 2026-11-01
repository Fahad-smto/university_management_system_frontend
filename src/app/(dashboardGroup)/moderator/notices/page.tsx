import type { Metadata } from 'next';
import Link from 'next/link';
import { Megaphone, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { StatusBadge } from '@/components/shared/status-badge';
import { NoticeFormDialog, NoticeRowActions } from '@/components/features/notice-actions';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import type { Notice } from '@/lib/types';

export const metadata: Metadata = { title: 'Manage notices' };

export default async function ModeratorNoticesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);

  // logged in as staff, so scheduled notices are included too
  const result = await api<Notice[]>('/notices', {
    query: { page: pageOf(params), limit: 10, searchTerm: params.searchTerm, category: params.category },
  });
  const now = new Date();

  return (
    <>
      <PageHeader
        title="Notices"
        description="Publish announcements now or schedule them for later."
        actions={<NoticeFormDialog trigger={<Button><Plus /> New notice</Button>} />}
      />

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
        <EmptyState icon={Megaphone} title="No notices found" description="Publish the first notice with the button above." />
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Notice</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Publish time</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell className="max-w-sm">
                      <Link href={`/notices/${notice.id}`} className="line-clamp-1 font-medium hover:text-primary hover:underline">{notice.title}</Link>
                    </TableCell>
                    <TableCell><StatusBadge status={notice.category} /></TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="text-muted-foreground">{formatDateTime(notice.publishedAt)}</span>
                      {new Date(notice.publishedAt) > now ? <Badge variant="warning" className="ml-2">Scheduled</Badge> : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{notice.createdBy?.name ?? '—'}</TableCell>
                    <TableCell className="text-right"><NoticeRowActions notice={notice} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Pagination meta={result.meta} basePath="/moderator/notices" params={params} />
        </>
      )}
    </>
  );
}
