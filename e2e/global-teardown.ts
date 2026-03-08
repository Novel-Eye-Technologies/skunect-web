/**
 * Playwright global teardown — runs once after all tests.
 * Resets seed data to a known state via the super admin API.
 */
import fs from 'fs';
import path from 'path';
import { API_BASE_URL } from './fixtures/test-accounts';

async function globalTeardown() {
  console.log('\n🔄 Resetting seed data after test run...\n');

  try {
    // Read the super admin auth token from saved storage state
    const authFile = path.resolve(process.cwd(), '.auth/super-admin.json');
    if (!fs.existsSync(authFile)) {
      console.log('  ⚠ No super-admin auth file found, skipping seed reset.');
      return;
    }

    const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    const zustand = JSON.parse(authData.origins[0].localStorage[0].value);
    const token = zustand.state.accessToken as string;

    const res = await fetch(`${API_BASE_URL}/admin/seed/reset`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      console.log('  ✅ Seed data reset successfully.\n');
    } else {
      const body = await res.text();
      console.warn(`  ⚠ Seed reset returned ${res.status}: ${body}\n`);
    }
  } catch (error) {
    console.warn('  ⚠ Failed to reset seed data:', error);
    // Non-fatal — tests already completed
  }
}

export default globalTeardown;
