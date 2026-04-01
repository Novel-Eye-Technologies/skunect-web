/**
 * All test accounts seeded in the Skunect database.
 * Every account uses the fixed dev OTP: 123456
 */

export interface TestAccount {
  email: string;
  otp: string;
  expectedRole: string;
  expectedSchoolName: string | null;
  expectedSchoolId: string | null;
  storageStatePath: string;
  /** The nav items this role should see in the sidebar (top-level titles). */
  expectedNavItems: string[];
  /** Routes this role should NOT be able to access. */
  blockedRoutes: string[];
}

export const TEST_OTP = '123456';

export const TEST_ACCOUNTS = {
  superAdmin: {
    email: 'superadmin@skunect.com',
    otp: TEST_OTP,
    expectedRole: 'SUPER_ADMIN',
    expectedSchoolName: null,
    expectedSchoolId: null,
    storageStatePath: '.auth/super-admin.json',
    expectedNavItems: ['System Dashboard', 'All Schools', 'Super Admins', 'Subscription Plans', 'Subscription Dashboard', 'Bulk Subscriptions', 'Discounts', 'Seed Data', 'Help & Support'],
    blockedRoutes: [],
  },
  adminKings: {
    email: 'admin@kingsacademy.ng',
    otp: TEST_OTP,
    expectedRole: 'ADMIN',
    expectedSchoolName: 'Kings Academy Lagos',
    expectedSchoolId: null, // set dynamically after auth
    storageStatePath: '.auth/admin-kings.json',
    expectedNavItems: [
      'Dashboard',
      'People',
      'Academics',
      'Promotions',
      'Calendar',
      'Communication',
      'Safety & Welfare',
      'School Bus',
      'Fees',
      'Subscription',
      'Analytics',
      'Settings',
      'Help & Support',
    ],
    blockedRoutes: ['/system/schools', '/system/seed'],
  },
  adminGreenfield: {
    email: 'admin@greenfield.edu.ng',
    otp: TEST_OTP,
    expectedRole: 'ADMIN',
    expectedSchoolName: 'Greenfield International School',
    expectedSchoolId: null,
    storageStatePath: '.auth/admin-greenfield.json',
    expectedNavItems: [
      'Dashboard',
      'People',
      'Academics',
      'Promotions',
      'Calendar',
      'Communication',
      'Safety & Welfare',
      'School Bus',
      'Fees',
      'Subscription',
      'Analytics',
      'Settings',
      'Help & Support',
    ],
    blockedRoutes: ['/system/schools', '/system/seed'],
  },
  teacherKings: {
    email: 'teacher1@kingsacademy.ng',
    otp: TEST_OTP,
    expectedRole: 'TEACHER',
    expectedSchoolName: 'Kings Academy Lagos',
    expectedSchoolId: null,
    storageStatePath: '.auth/teacher-kings.json',
    expectedNavItems: [
      'Dashboard',
      'Students',
      'My Classes',
      'Academics',
      'Calendar',
      'Communication',
      'Safety & Welfare',
      'Fees',
      'Notification Preferences',
      'Help & Support',
    ],
    blockedRoutes: ['/system/schools', '/system/seed', '/school-settings', '/admins', '/data-migration'],
  },
  teacherGreenfield: {
    email: 'teacher1@greenfield.edu.ng',
    otp: TEST_OTP,
    expectedRole: 'TEACHER',
    expectedSchoolName: 'Greenfield International School',
    expectedSchoolId: null,
    storageStatePath: '.auth/teacher-greenfield.json',
    expectedNavItems: [
      'Dashboard',
      'Students',
      'My Classes',
      'Academics',
      'Calendar',
      'Communication',
      'Safety & Welfare',
      'Fees',
      'Notification Preferences',
      'Help & Support',
    ],
    blockedRoutes: ['/system/schools', '/system/seed', '/school-settings', '/admins', '/data-migration'],
  },
  parentSingle: {
    email: 'parent1@example.com',
    otp: TEST_OTP,
    expectedRole: 'PARENT',
    expectedSchoolName: 'Kings Academy Lagos',
    expectedSchoolId: null,
    storageStatePath: '.auth/parent-single.json',
    expectedNavItems: ['Dashboard', 'Children Profile', 'Homework', 'Communication', 'Fees', 'Notification Preferences', 'Help & Support'],
    blockedRoutes: [
      '/system/schools',
      '/system/seed',
      '/school-settings',
      '/admins',
      '/attendance',
      '/data-migration',
    ],
  },
  parentCross: {
    email: 'parent2@example.com',
    otp: TEST_OTP,
    expectedRole: 'PARENT',
    expectedSchoolName: null, // cross-school — depends on selection
    expectedSchoolId: null,
    storageStatePath: '.auth/parent-cross.json',
    expectedNavItems: ['Dashboard', 'Children Profile', 'Homework', 'Communication', 'Fees', 'Notification Preferences', 'Help & Support'],
    blockedRoutes: [
      '/system/schools',
      '/system/seed',
      '/school-settings',
      '/admins',
      '/attendance',
      '/data-migration',
    ],
  },
  parentGreenfield: {
    email: 'parent3@example.com',
    otp: TEST_OTP,
    expectedRole: 'PARENT',
    expectedSchoolName: 'Greenfield International School',
    expectedSchoolId: null,
    storageStatePath: '.auth/parent-greenfield.json',
    expectedNavItems: ['Dashboard', 'Children Profile', 'Homework', 'Communication', 'Fees', 'Notification Preferences', 'Help & Support'],
    blockedRoutes: [
      '/system/schools',
      '/system/seed',
      '/school-settings',
      '/admins',
      '/attendance',
      '/data-migration',
    ],
  },
  teacherParent: {
    email: 'teacher.parent@example.com',
    otp: TEST_OTP,
    expectedRole: 'TEACHER', // defaults to first role
    expectedSchoolName: null, // dual-role — depends on selection
    expectedSchoolId: null,
    storageStatePath: '.auth/teacher-parent.json',
    expectedNavItems: [], // depends on which school selected
    blockedRoutes: [],
  },
  // Skunect Academy — used for marketing screenshots
  adminSkunect: {
    email: 'admin@skunect.academy',
    otp: TEST_OTP,
    expectedRole: 'ADMIN',
    expectedSchoolName: 'Skunect Academy',
    expectedSchoolId: null,
    storageStatePath: '.auth/admin-skunect.json',
    expectedNavItems: [
      'Dashboard',
      'People',
      'Academics',
      'Promotions',
      'Calendar',
      'Communication',
      'Safety & Welfare',
      'School Bus',
      'Fees',
      'Subscription',
      'Analytics',
      'Settings',
      'Help & Support',
    ],
    blockedRoutes: ['/system/schools', '/system/seed'],
  },
  teacherSkunect: {
    email: 'teacher1@skunect.academy',
    otp: TEST_OTP,
    expectedRole: 'TEACHER',
    expectedSchoolName: 'Skunect Academy',
    expectedSchoolId: null,
    storageStatePath: '.auth/teacher-skunect.json',
    expectedNavItems: [
      'Dashboard',
      'Students',
      'My Classes',
      'Academics',
      'Calendar',
      'Communication',
      'Safety & Welfare',
      'Fees',
      'Notification Preferences',
      'Help & Support',
    ],
    blockedRoutes: ['/system/schools', '/system/seed', '/school-settings', '/admins', '/data-migration'],
  },
  parentSkunect: {
    email: 'parent@skunect.academy',
    otp: TEST_OTP,
    expectedRole: 'PARENT',
    expectedSchoolName: 'Skunect Academy',
    expectedSchoolId: null,
    storageStatePath: '.auth/parent-skunect.json',
    expectedNavItems: ['Dashboard', 'Children Profile', 'Homework', 'Communication', 'Fees', 'Notification Preferences', 'Help & Support'],
    blockedRoutes: [
      '/system/schools',
      '/system/seed',
      '/school-settings',
      '/admins',
      '/attendance',
      '/data-migration',
    ],
  },
} as const satisfies Record<string, TestAccount>;

export type TestAccountKey = keyof typeof TEST_ACCOUNTS;

/** API base URL used for direct API calls in setup/helpers. */
export const API_BASE_URL =
  process.env.E2E_API_URL ||
  `${process.env.E2E_BASE_URL || 'https://dev.skunect.com'}/api/v1`;
