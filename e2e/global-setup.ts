/**
 * Playwright global setup — runs once before all tests.
 *
 * 1. Resets the database to seed data (via SUPER_ADMIN API).
 * 2. Authenticates every test account via API and writes storageState
 *    JSON files so tests can inject pre-authenticated localStorage.
 */
import fs from 'fs';
import path from 'path';
import { TEST_ACCOUNTS, API_BASE_URL, type TestAccountKey } from './fixtures/test-accounts';
import { authenticateAccount, apiPost } from './helpers/api.helper';

const BASE_URL = process.env.E2E_BASE_URL || 'https://dev.skunect.com';

/**
 * Build a Playwright-compatible storageState object that includes
 * the Zustand auth store in localStorage.
 */
function buildStorageState(authData: {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    roles: Array<{
      schoolId: string | null;
      schoolName: string;
      role: string;
    }>;
  };
}) {
  const { user } = authData;

  // Determine currentSchoolId and currentRole (mirrors auth-store.ts logic)
  const superAdminRole = user.roles.find((r) => r.role === 'SUPER_ADMIN');
  let currentSchoolId: string | null = null;
  let currentRole: string | null = null;

  if (superAdminRole) {
    currentSchoolId = null;
    currentRole = 'SUPER_ADMIN';
  } else if (user.roles.length > 0) {
    currentSchoolId = user.roles[0].schoolId;
    currentRole = user.roles[0].role;
  }

  const zustandState = {
    state: {
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      user,
      currentSchoolId,
      currentRole,
    },
    version: 0,
  };

  return {
    cookies: [],
    origins: [
      {
        origin: BASE_URL,
        localStorage: [
          {
            name: 'skunect-auth',
            value: JSON.stringify(zustandState),
          },
        ],
      },
    ],
  };
}

async function globalSetup() {
  // ── Step 1: Reset seed data ───────────────────────────────────────────────
  console.log('\n--- Phase 0: Seed Data Reset ---\n');

  try {
    // Authenticate as SUPER_ADMIN
    console.log('  Authenticating as superadmin@skunect.com...');
    const superAdminAuth = await authenticateAccount(
      TEST_ACCOUNTS.superAdmin.email,
      TEST_ACCOUNTS.superAdmin.otp
    );

    // Call seed reset endpoint
    console.log('  Resetting seed data...');
    await apiPost('/admin/seed/reset', superAdminAuth.accessToken);
    console.log('  Seed data reset successfully.');

    // Verify seed data by logging in as a seed account
    console.log('  Verifying seed data (admin@kingsacademy.ng)...');
    await authenticateAccount('admin@kingsacademy.ng', '123456');
    console.log('  Seed data verified.\n');
  } catch (error) {
    console.error('  Seed data reset failed:', error);
    throw error;
  }

  // ── Step 2: Authenticate all test accounts ────────────────────────────────
  // Ensure .auth directory exists
  const authDir = path.resolve(process.cwd(), '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const accountKeys = Object.keys(TEST_ACCOUNTS) as TestAccountKey[];

  console.log(`\n--- Authenticating ${accountKeys.length} test accounts ---\n`);

  // Authenticate all accounts sequentially to avoid rate-limiting
  for (const key of accountKeys) {
    const account = TEST_ACCOUNTS[key];
    try {
      console.log(`  ✓ Authenticating ${account.email}...`);
      const authData = await authenticateAccount(account.email, account.otp);

      const storageState = buildStorageState(authData);
      const filePath = path.resolve(process.cwd(), account.storageStatePath);
      fs.writeFileSync(filePath, JSON.stringify(storageState, null, 2));

      console.log(`    → Saved to ${account.storageStatePath}`);
    } catch (error) {
      console.error(`  ✗ Failed to authenticate ${account.email}:`, error);
      throw error;
    }
  }

  console.log('\n--- All test accounts authenticated successfully ---\n');
}

export default globalSetup;
