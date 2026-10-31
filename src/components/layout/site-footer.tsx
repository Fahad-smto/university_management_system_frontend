import Link from 'next/link';
import { Logo } from '@/components/shared/common';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            The home of our college student organization: memberships, events, notices and monthly fees in one simple
            place.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Explore</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/notices">Notices</Link></li>
            <li><Link className="hover:text-foreground" href="/events">Events</Link></li>
            <li><Link className="hover:text-foreground" href="/members">Member directory</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Account</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/login">Log in</Link></li>
            <li><Link className="hover:text-foreground" href="/register">Become a member</Link></li>
            <li><Link className="hover:text-foreground" href="/dashboard">My dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} College Org. An unofficial student organization portal.
      </div>
    </footer>
  );
}
