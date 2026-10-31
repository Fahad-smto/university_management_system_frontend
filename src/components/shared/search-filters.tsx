'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/form';
import { Spinner } from '@/components/shared/common';

export type FilterField = {
  name: string;
  type: 'search' | 'select';
  placeholder?: string;
  options?: { label: string; value: string }[];
};

// Filters live in the URL, so the server renders the filtered list (fast, shareable, back button works)
export function SearchFilters({
  fields,
  current,
}: {
  fields: FilterField[];
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(current);
  latest.current = current;

  function update(name: string, value: string) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(latest.current)) {
      if (val && key !== 'page') params.set(key, val);
    }
    if (value) params.set(name, value);
    else params.delete(name);

    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  function onSearchChange(name: string, value: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => update(name, value.trim()), 400);
  }

  const hasFilters = fields.some((field) => current[field.name]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {fields.map((field) =>
        field.type === 'search' ? (
          <div key={`${field.name}-${resetKey}`} className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={field.placeholder ?? 'Search…'}
              defaultValue={current[field.name] ?? ''}
              onChange={(event) => onSearchChange(field.name, event.target.value)}
            />
          </div>
        ) : (
          <div key={field.name} className="w-full sm:w-44">
            <Select
              aria-label={field.placeholder}
              value={current[field.name] ?? ''}
              onChange={(event) => update(field.name, event.target.value)}
            >
              <option value="">{field.placeholder ?? 'All'}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        ),
      )}

      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setResetKey((key) => key + 1);
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
        >
          <X /> Clear
        </Button>
      ) : null}
      {pending ? <Spinner className="text-muted-foreground" /> : null}
    </div>
  );
}
