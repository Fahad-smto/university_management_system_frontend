'use client';

import { useActionState, useEffect, useState, useTransition, type ReactNode } from 'react';
import { createNoticeAction, deleteNoticeAction, updateNoticeAction } from '@/service/notice-mutations';
import type { Notice, NoticeCategory } from '@/lib/types';

const CATEGORIES: NoticeCategory[] = ['GENERAL', 'EVENT', 'ELECTION', 'URGENT'];
const INPUT = 'w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring';
const BUTTON = 'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60';
const GHOST = 'rounded-md border px-3 py-1.5 text-sm hover:bg-muted';

export function NoticeFormDialog({ notice, label, trigger }: { notice?: Notice; label?: string; trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const action = notice ? updateNoticeAction.bind(null, notice.id) : createNoticeAction;
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state]);

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="inline-flex cursor-pointer">{trigger}</span>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={notice ? GHOST : BUTTON}>
          {label ?? (notice ? 'Edit' : 'New notice')}
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <form
            action={formAction}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg space-y-4 rounded-lg bg-background p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">{notice ? 'Edit notice' : 'New notice'}</h2>
            <input name="title" defaultValue={notice?.title} placeholder="Title" className={INPUT} required />
            <select name="category" defaultValue={notice?.category ?? 'GENERAL'} className={INPUT}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea name="content" defaultValue={notice?.content} placeholder="Content" rows={6} className={INPUT} required />
            {state.message && !state.success && <p className="text-sm text-red-600">{state.message}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className={GHOST}>Cancel</button>
              <button className={BUTTON} disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export function NoticeRowActions({ notice }: { notice: Notice }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <NoticeFormDialog notice={notice} />
      <button
        type="button"
        disabled={pending}
        className={`${GHOST} text-red-600`}
        onClick={() => {
          if (confirm(`Delete "${notice.title}"?`)) start(async () => { await deleteNoticeAction(notice.id); });
        }}
      >
        {pending ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}