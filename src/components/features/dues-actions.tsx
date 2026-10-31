'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/form';
import { Spinner } from '@/components/shared/common';
import { generateDuesAction } from '@/actions/payment';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { MONTHS } from '@/lib/format';

// The form is mounted only while the dialog is open, so the default month and year are read in the browser
function GenerateForm({ onDone }: { onDone: () => void }) {
  const { submit, pending, errors } = useFormSubmit();
  const now = new Date();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    submit(
      () =>
        generateDuesAction({
          month: Number(form.get('month')),
          year: Number(form.get('year')),
          amount: Number(form.get('amount')),
        }),
      onDone,
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Month" htmlFor="month" error={errors.month}>
        <Select id="month" name="month" defaultValue={String(now.getMonth() + 1)}>
          {MONTHS.map((month, index) => (
            <option key={month} value={index + 1}>{month}</option>
          ))}
        </Select>
      </Field>
      <Field label="Year" htmlFor="year" error={errors.year}>
        <Input id="year" name="year" type="number" min={2024} max={2100} defaultValue={now.getFullYear()} required />
      </Field>
      <Field label="Amount per member (৳)" htmlFor="amount" error={errors.amount} className="sm:col-span-2" hint="Every active member gets one due. Running it twice for the same month creates no duplicates.">
        <Input id="amount" name="amount" type="number" min={1} step="1" placeholder="200" required />
      </Field>
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>Cancel</Button>
        <Button type="submit" disabled={pending}>{pending ? <Spinner /> : null} Generate dues</Button>
      </DialogFooter>
    </form>
  );
}

export function GenerateDuesDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus /> Generate monthly dues</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate monthly dues</DialogTitle>
          <DialogDescription>Create the fee for every active member for one month. The due date is the last day of that month.</DialogDescription>
        </DialogHeader>
        <GenerateForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
