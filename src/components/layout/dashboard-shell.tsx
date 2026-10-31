'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, LogOut, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/shared/common';
import { StatusBadge } from '@/components/shared/status-badge';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useLogout } from '@/hooks/use-logout';
import { getNavSections, type NavItem } from '@/lib/nav';
import { cn } from '@/lib/utils';

type ShellUser = { name: string; email: string; role: string; profileImage?: string | null };

export function DashboardShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout } = useLogout();
  const sections = getNavSections(user.role);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <div className="min-h-dvh bg-muted/40">
      {open ? <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} /> : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b px-5">
          <Logo href="/" />
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground',
                        isActive(item) && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t p-4">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/">
              <ArrowLeft /> Back to website
            </Link>
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="glass sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 outline-none transition hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40">
                  <UserAvatar name={user.name} src={user.profileImage} className="size-8" />
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-32 truncate text-sm font-medium leading-tight">{user.name}</span>
                    <span className="block text-[11px] leading-tight text-muted-foreground">{user.role.replace('_', ' ')}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60">
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  <StatusBadge status={user.role} className="mt-2" />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User /> My profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={logout}>
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
