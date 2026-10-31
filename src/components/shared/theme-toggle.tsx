'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

// The dark class is set before the page paints (script in the root layout), so there is no flash
export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      // storage can be blocked, the toggle still works for this visit
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
