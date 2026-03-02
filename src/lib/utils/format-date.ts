import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

type DateInput = string | number | Date | null | undefined;

/**
 * Normalise any date input into a `Date` object.
 * Accepts ISO strings, Unix timestamps (ms), or Date instances.
 * Returns null for invalid / missing values so callers can provide a fallback.
 */
function toDate(input: DateInput): Date | null {
  if (input == null) return null;
  if (input instanceof Date) return isValid(input) ? input : null;
  if (typeof input === 'string') {
    if (input.trim() === '') return null;
    const parsed = parseISO(input);
    return isValid(parsed) ? parsed : null;
  }
  const d = new Date(input);
  return isValid(d) ? d : null;
}

/** e.g. "Feb 28, 2026" — returns '—' for invalid/missing dates */
export function formatDate(date: DateInput): string {
  const d = toDate(date);
  return d ? format(d, 'MMM d, yyyy') : '—';
}

/** e.g. "Feb 28, 2026, 2:30 PM" — returns '—' for invalid/missing dates */
export function formatDateTime(date: DateInput): string {
  const d = toDate(date);
  return d ? format(d, 'MMM d, yyyy, h:mm a') : '—';
}

/** e.g. "02/28/2026" — returns '—' for invalid/missing dates */
export function formatDateShort(date: DateInput): string {
  const d = toDate(date);
  return d ? format(d, 'MM/dd/yyyy') : '—';
}

/** e.g. "2 hours ago" — returns '—' for invalid/missing dates */
export function formatRelative(date: DateInput): string {
  const d = toDate(date);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '—';
}
