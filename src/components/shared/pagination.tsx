import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Meta } from '@/lib/types';

// Server rendered pagination: every page is a normal link, so it works without JavaScript
export function Pagination({
  meta,
  basePath,
  params,
}: {
  meta?: Meta;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (!meta) return null;

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  if (totalPages <= 1) return null;

  const href = (page: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== 'page') search.set(key, value);
    }
    search.set('page', String(page));
    return `${basePath}?${search.toString()}`;
  };

  const pages: (number | 'gap')[] = [];
  for (let page = 1; page <= totalPages; page++) {
    if (page === 1 || page === totalPages || Math.abs(page - meta.page) <= 1) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap');
    }
  }

  return (
    <nav className="flex flex-col items-center justify-between gap-3 pt-6 sm:flex-row" aria-label="Pagination">
      <p className="text-sm text-muted-foreground">
        Page {meta.page} of {totalPages} · {meta.total} results
      </p>
      <div className="flex items-center gap-1.5">
        {meta.page > 1 ? (
          <Button asChild variant="outline" size="icon">
            <Link href={href(meta.page - 1)} aria-label="Previous page">
              <ChevronLeft />
            </Link>
          </Button>
        ) : null}
        {pages.map((page, index) =>
          page === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <Button key={page} asChild variant={page === meta.page ? 'default' : 'outline'} size="icon">
              <Link href={href(page)}>{page}</Link>
            </Button>
          ),
        )}
        {meta.page < totalPages ? (
          <Button asChild variant="outline" size="icon">
            <Link href={href(meta.page + 1)} aria-label="Next page">
              <ChevronRight />
            </Link>
          </Button>
        ) : null}
      </div>
    </nav>
  );
}
