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
  '/users',
  '/fees',
  '/data-migration',
];

/**
 * Routes that require the SUPER_ADMIN role.
 */
export const SUPER_ADMIN_ONLY_ROUTES: string[] = [
  '/system',
];
