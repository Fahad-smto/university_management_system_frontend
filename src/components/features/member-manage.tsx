'use client';

import { useState, useTransition } from 'react';
import { Ellipsis, Layers, Trash2, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, Input } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Spinner } from '@/components/shared/common';
import { assignSectionAction, deleteMemberAction, setMemberStatusAction } from '@/actions/member';
import { useAction } from '@/hooks/use-action';
import type { PublicMember } from '@/lib/types';

function AssignSectionDialog({
  member,
  open,
  onOpenChange,
}: {
  member: PublicMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [sectionId, setSectionId] = useState('');

  function submit() {
    startTransition(async () => {
      const result = await assignSectionAction(member.id, sectionId.trim());
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a section</DialogTitle>
          <DialogDescription>Put {member.user.name} into a section (for example Cultural or Sports).</DialogDescription>
        </DialogHeader>
        <Field label="Section ID" htmlFor="sectionId" hint="Paste the id of an existing section.">
          <Input id="sectionId" value={sectionId} onChange={(event) => setSectionId(event.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={!sectionId.trim() || pending}>{pending ? <Spinner /> : null} Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// The directory only lists ACTIVE members, so the possible status changes are INACTIVE and EXPIRED
export function MemberRowActions({ member, canDelete }: { member: PublicMember; canDelete: boolean }) {
  const [dialog, setDialog] = useState<'section' | 'delete' | null>(null);
  const { run, pending } = useAction();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Member actions" disabled={pending}>
            {pending ? <Spinner /> : <Ellipsis />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setDialog('section')}><Layers /> Assign section</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => run(() => setMemberStatusAction(member.id, 'INACTIVE'))}><UserX /> Set inactive</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => run(() => setMemberStatusAction(member.id, 'EXPIRED'))}><UserX /> Mark expired</DropdownMenuItem>
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDialog('delete')}><Trash2 /> Remove member</DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AssignSectionDialog member={member} open={dialog === 'section'} onOpenChange={(value) => setDialog(value ? 'section' : null)} />
      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={(value) => setDialog(value ? 'delete' : null)}
        title={`Remove ${member.user.name}?`}
        description="The membership is deactivated and hidden from the directory."
        confirmLabel="Remove"
        destructive
        action={deleteMemberAction}
        args={[member.id]}
      />
    </>
  );
}
