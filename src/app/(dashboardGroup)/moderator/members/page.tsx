import type { Metadata } from 'next';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, PageHeader } from '@/components/shared/common';
import { Pagination } from '@/components/shared/pagination';
import { SearchFilters } from '@/components/shared/search-filters';
import { MemberRowActions } from '@/components/features/member-actions';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { isAdmin } from '@/lib/routes';
import { pageOf, readParams, type SearchParams } from '@/lib/search-params';
import { getMe } from '@/service/session';
import type { PublicMember } from '@/lib/types';

export const metadata: Metadata = { title: 'Manage members' };

export default async function ModeratorMembersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await readParams(searchParams);
  const [me, result] = await Promise.all([
    getMe(),
    api<PublicMember[]>('/members/public', {
      query: { page: pageOf(params), limit: 10, searchTerm: params.searchTerm, session: params.session, class: params.class },
    }),
  ]);

  const canDelete = me.success && isAdmin(me.data.role);

  return (
    <>
      <PageHeader
        title="Members"
        description="Active members of the organization. New applications waiting for approval are handled on the Users page by an admin."
      />

      <SearchFilters
        current={params}
        fields={[
          { name: 'searchTerm', type: 'search', placeholder: 'Search by name or student ID…' },
          { name: 'session', type: 'search', placeholder: 'Session' },
          { name: 'class', type: 'search', placeholder: 'Class' },
        ]}
      />

      {!result.success ? (
        <EmptyState icon={Users} title="Could not load members" description={result.message} />
      ) : result.data.length === 0 ? (
        <EmptyState icon={Users} title="No members found" description="Try a different search." />
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Member</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Link href={`/members/${member.id}`} className="flex items-center gap-3 font-medium hover:text-primary">
                        <UserAvatar name={member.user.name} src={member.user.profileImage} className="size-9" />
                        {member.user.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.studentIdNo}</TableCell>
                    <TableCell>{member.class}<span className="block text-xs text-muted-foreground">{member.session}</span></TableCell>
                    <TableCell className="text-muted-foreground">{member.section?.name ?? '—'}</TableCell>
                    <TableCell>{member.user.phone ?? '—'}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(member.joinedAt)}</TableCell>
                    <TableCell className="text-right">
                      <MemberRowActions memberId={member.id} name={member.user.name} canDelete={canDelete} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Pagination meta={result.meta} basePath="/moderator/members" params={params} />
        </>
      )}
    </>
  );
}
