import { format, formatDistanceToNow, parseISO } from 'date-fns';

type DateInput = string | number | Date;

/**
 * Normalise any date input into a `Date` object.
 * Accepts ISO strings, Unix timestamps (ms), or Date instances.
 */
function toDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'string') return parseISO(input);
  return new Date(input);
}

/** e.g. "Feb 28, 2026" */
export function formatDate(date: DateInput): string {
  return format(toDate(date), 'MMM d, yyyy');
}

/** e.g. "Feb 28, 2026, 2:30 PM" */
export function formatDateTime(date: DateInput): string {
  return format(toDate(date), 'MMM d, yyyy, h:mm a');
}

/** e.g. "02/28/2026" */
export function formatDateShort(date: DateInput): string {
  return format(toDate(date), 'MM/dd/yyyy');
}

/** e.g. "2 hours ago" */
export function formatRelative(date: DateInput): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true });
}
