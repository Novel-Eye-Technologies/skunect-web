/** Tiny 1x1 pixel base64 placeholder for blur effect on Next.js images */
export const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk2iLajgAAAABJRU5ErkJggg==';

export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
} as const;

export const INVOICE_STATUS = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
} as const;

export const ASSESSMENT_TYPES = {
  CA1: 'CA1',
  CA2: 'CA2',
  CA3: 'CA3',
  EXAM: 'EXAM',
} as const;

export const AUTH_METHODS = {
  EMAIL_OTP: 'EMAIL_OTP',
  PHONE_OTP: 'PHONE_OTP',
  GOOGLE: 'GOOGLE',
} as const;

/**
 * Routes that require the ADMIN role.
 * The auth provider will redirect non-admin users to /dashboard.
 */
export const ADMIN_ONLY_ROUTES: string[] = [
  '/school-settings',
  '/admins',
  '/data-migration',
  '/subscription',
];

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  GRACE_PERIOD: 'GRACE_PERIOD',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
} as const;

export const PAYMENT_TYPES = {
  FULL: 'FULL',
  PARTIAL: 'PARTIAL',
  PRORATED: 'PRORATED',
  UPGRADE: 'UPGRADE',
  RENEWAL: 'RENEWAL',
} as const;

/**
 * Routes that teachers cannot access (but parents can).
 * These are not admin-only — they're shared between ADMIN and PARENT roles.
 */
export const TEACHER_BLOCKED_ROUTES: string[] = [];

/**
 * Routes that require the SUPER_ADMIN role.
 */
export const SUPER_ADMIN_ONLY_ROUTES: string[] = [
  '/system',
];
