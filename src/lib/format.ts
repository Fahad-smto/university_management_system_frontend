// All dates are shown in Bangladesh time so the server and the browser always print the same text.
const TZ = 'Asia/Dhaka';

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: TZ }).format(
    new Date(iso),
  );
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatMoney(value?: string | number | null): string {
  const amount = Number(value ?? 0);
  return `৳${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const monthLabel = (month: number, year?: number) =>
  `${MONTHS[month - 1] ?? month}${year ? ` ${year}` : ''}`;

export const initials = (name?: string | null) =>
  (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

export const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const excerpt = (text: string, max = 140) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" in the browser's local time
export function toDateTimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Total number of rows from a list response (used for the overview numbers)
export const metaTotal = (result: ApiResult<unknown>): number => (result.success ? (result.meta?.total ?? 0) : 0);
import type { ApiResult } from './types';
