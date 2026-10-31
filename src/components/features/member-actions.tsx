'use client';

import { useState } from 'react';
import { BadgeCheck, Ellipsis, Layers, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Field, Input } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Spinner } from '@/components/shared/common';
import { assignSectionAction, deleteMemberAction, setMemberStatusAction } from '@/actions/member';
import { useAction } from '@/hooks/use-action';
import { titleCase } from '@/lib/format';
import { MEMBER_TRANSITIONS } from '@/lib/routes';
import type { MembershipStatus } from '@/lib/types';

function SectionDialog({ memberId, onClose }: { memberId: string; onClose: () => void }) {
  const [sectionId, setSectionId] = useState('');
  const { run, pending } = useAction();

  return (
    <Dialog open onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign section</DialogTitle>
          <DialogDescription>Paste the id of the section this member should belong to.</DialogDescription>
        </DialogHeader>
        <Field label="Section id" htmlFor="sectionId">
          <Input id="sectionId" value={sectionId} onChange={(event) => setSectionId(event.target.value.trim())} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button disabled={pending || !sectionId} onClick={() => run(() => assignSectionAction(memberId, sectionId), { onSuccess: onClose })}>
            {pending ? <Spinner /> : null} Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Actions on a member of the directory (active members). status is the current membership status.
export function MemberRowActions({
  memberId,
  name,
  status = 'ACTIVE',
  canDelete,
}: {
  memberId: string;
  name: string;
  status?: MembershipStatus;
  canDelete: boolean;
}) {
  const [dialog, setDialog] = useState<'section' | 'delete' | null>(null);
  const { run } = useAction();
  const moves = MEMBER_TRANSITIONS[status];

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Member actions"><Ellipsis /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setDialog('section')}><Layers /> Assign section</DropdownMenuItem>
          {moves.map((move) => (
            <DropdownMenuItem key={move} onSelect={() => run(() => setMemberStatusAction(memberId, move))}>
              <BadgeCheck /> Set {titleCase(move)}
            </DropdownMenuItem>
          ))}
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDialog('delete')}><Trash2 /> Remove member</DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {dialog === 'section' ? <SectionDialog memberId={memberId} onClose={() => setDialog(null)} /> : null}

      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(value) => setDialog(value ? 'delete' : null)}
        title="Remove this member?"
        description={`${name} will be removed from the member directory.`}
        confirmLabel="Remove member"
        destructive
        action={deleteMemberAction}
        args={[memberId]}
      />
    </>
  );
}
