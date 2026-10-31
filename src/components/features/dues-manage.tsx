'use client';

import { useState, useTransition } from 'react';
import { ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/form';
import { Spinner } from '@/components/shared/common';
import { generateDuesAction } from '@/actions/payment';
import { MONTHS } from '@/lib/format';

type Errors = Record<string, string>;

// Creates one due per ACTIVE member for the chosen month. Running it twice never creates duplicates.
export function GenerateDuesDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});
  const now = new Date();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await generateDuesAction({
        month: Number(form.get('month')),
        year: Number(form.get('year')),
        amount: Number(form.get('amount')),
      });

      if (result.success) {
        toast.success(result.message);
        setErrors({});
        setOpen(false);
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><ReceiptText /> Generate monthly dues</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate monthly dues</DialogTitle>
          <DialogDescription>
            Every active member gets a due for this month. The due date is the last day of the month.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Month" htmlFor="month" error={errors.month}>
              <Select id="month" name="month" defaultValue={String(now.getMonth() + 1)}>
                {MONTHS.map((label, index) => (
                  <option key={label} value={index + 1}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Year" htmlFor="year" error={errors.year}>
              <Input id="year" name="year" type="number" min={2024} max={2100} defaultValue={now.getFullYear()} required />
            </Field>
          </div>
          <Field label="Amount per member (BDT)" htmlFor="amount" error={errors.amount}>
            <Input id="amount" name="amount" type="number" min={1} step="any" placeholder="200" required />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? <Spinner /> : null} Generate</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
