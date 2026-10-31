import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  Receipt,
  ShieldCheck,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { isAdmin, isStaff } from './routes';

export type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };
export type NavSection = { title: string; items: NavItem[] };

// The sidebar shows only what the logged in role is allowed to open
export function getNavSections(role: string): NavSection[] {
  const sections: NavSection[] = [
    {
      title: 'My space',
      items: [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
        { href: '/dashboard/profile', label: 'Profile', icon: User },
        { href: '/dashboard/events', label: 'My events', icon: CalendarDays },
        { href: '/dashboard/dues', label: 'Monthly dues', icon: Receipt },
        { href: '/dashboard/payments', label: 'Payments', icon: Wallet },
        { href: '/dashboard/security', label: 'Security', icon: ShieldCheck },
      ],
    },
  ];

  if (isStaff(role)) {
    sections.push({
      title: 'Moderation',
      items: [
        { href: '/moderator', label: 'Overview', icon: ClipboardList, exact: true },
        { href: '/moderator/members', label: 'Members', icon: Users },
        { href: '/moderator/events', label: 'Events', icon: CalendarDays },
        { href: '/moderator/notices', label: 'Notices', icon: Megaphone },
        { href: '/moderator/dues', label: 'All dues', icon: Receipt },
      ],
    });
  }

  if (isAdmin(role)) {
    sections.push({
      title: 'Administration',
      items: [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/payments', label: 'All payments', icon: CreditCard },
        { href: '/admin/dues', label: 'Billing', icon: Receipt },
      ],
    });
  }

  return sections;
}
