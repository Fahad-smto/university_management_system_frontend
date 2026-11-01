import Link from 'next/link';
import { CalendarDays, GraduationCap, Megaphone, Wallet } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';

const perks = [
  { icon: CalendarDays, text: 'Reserve seats at every event' },
  { icon: Megaphone, text: 'Never miss an official notice' },
  { icon: Wallet, text: 'Pay your monthly fee with bKash' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-white/10 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5 text-lg font-semibold">
          <span className="grid size-9 place-items-center rounded-xl bg-white/15"><GraduationCap className="size-5" /></span>
          CollegeOrg
        </Link>

        <div className="relative space-y-8">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Everything your organization needs, in one place.</h2>
          <ul className="space-y-4">
            {perks.map((perk) => (
              <li key={perk.text} className="flex items-center gap-3 text-primary-foreground/90">
                <span className="grid size-9 place-items-center rounded-lg bg-white/15"><perk.icon className="size-4" /></span>
                {perk.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/70">An unofficial college student organization portal.</p>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground lg:invisible">← Back to website</Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
