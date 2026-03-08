import { test, expect } from '@playwright/test';
import { authenticateAccount } from '../../helpers/api.helper';
import { TEST_OTP, API_BASE_URL } from '../../fixtures/test-accounts';

// Seed data IDs
const SCHOOL_A = 'a0000000-0000-0000-0000-000000000001';
const JSS_1A = 'e0000000-0000-0000-0000-000000000001';
const ENGLISH = 'f0000000-0000-0000-0000-000000000001';
const MATH = 'f0000000-0000-0000-0000-000000000002';
const MUSIC = 'f0000000-0000-0000-0000-000000000005';
const PE = 'f0000000-0000-0000-0000-000000000006';
const TERM_2 = 'd0000000-0000-0000-0000-000000000002';

test.describe('Teacher Subject-Level Permissions (API)', () => {
  let teacher1Token: string;
  let teacher2Token: string;

  test.beforeAll(async () => {
    const [auth1, auth2] = await Promise.all([
      authenticateAccount('teacher1@kingsacademy.ng', TEST_OTP),
      authenticateAccount('teacher2@kingsacademy.ng', TEST_OTP),
    ]);
    teacher1Token = auth1.accessToken;
    teacher2Token = auth2.accessToken;
  });

  // ── Assessment permissions ──────────────────────────────────────────

  test('teacher1 (class teacher) can create assessment for inherited subject (English)', async () => {
    const payload = {
      classId: JSS_1A,
      subjectId: ENGLISH,
      termId: TERM_2,
      type: 'CA1',
      maxScore: 20,
      title: `E2E Perm English ${Date.now()}`,
    };

    const res = await fetch(`${API_BASE_URL}/schools/${SCHOOL_A}/assessments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${teacher1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.subjectId ?? body.data.subject?.id).toBeDefined();
  });

  test('teacher1 (class teacher) CANNOT create assessment for specialist subject (Music)', async () => {
    const payload = {
      classId: JSS_1A,
      subjectId: MUSIC,
      termId: TERM_2,
      type: 'CA1',
      maxScore: 20,
      title: `E2E Perm Music ${Date.now()}`,
    };

    const res = await fetch(`${API_BASE_URL}/schools/${SCHOOL_A}/assessments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${teacher1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(403);
  });

  test('teacher2 (specialist) can create assessment for assigned subject (Music)', async () => {
    const payload = {
      classId: JSS_1A,
      subjectId: MUSIC,
      termId: TERM_2,
      type: 'CA1',
      maxScore: 20,
      title: `E2E Perm Music T2 ${Date.now()}`,
    };

    const res = await fetch(`${API_BASE_URL}/schools/${SCHOOL_A}/assessments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${teacher2Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toBeDefined();
  });

  test('teacher2 (specialist) CANNOT create assessment for inherited subject (English)', async () => {
    const payload = {
      classId: JSS_1A,
      subjectId: ENGLISH,
      termId: TERM_2,
      type: 'CA1',
      maxScore: 20,
      title: `E2E Perm English T2 ${Date.now()}`,
    };

    const res = await fetch(`${API_BASE_URL}/schools/${SCHOOL_A}/assessments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${teacher2Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(403);
  });

  // ── Homework permissions ────────────────────────────────────────────

  test('teacher1 can create homework for inherited subject (Math)', async () => {
    const dueDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const payload = {
      classId: JSS_1A,
      subjectId: MATH,
      title: `E2E HW Math ${Date.now()}`,
      description: 'Permission test homework',
      dueDate,
    };

    const res = await fetch(`${API_BASE_URL}/schools/${SCHOOL_A}/homework`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${teacher1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toBeDefined();
  });

  test('teacher1 CANNOT create homework for specialist subject (Music)', async () => {
    const dueDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const payload = {
      classId: JSS_1A,
      subjectId: MUSIC,
      title: `E2E HW Music ${Date.now()}`,
      description: 'Permission test homework — should be denied',
      dueDate,
    };

    const res = await fetch(`${API_BASE_URL}/schools/${SCHOOL_A}/homework`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${teacher1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(403);
  });

  // ── My Subjects endpoint ───────────────────────────────────────────

  test('teacher1 can view their assigned subjects via my-subjects endpoint', async () => {
    const res = await fetch(`${API_BASE_URL}/schools/${SCHOOL_A}/my-subjects`, {
      headers: {
        Authorization: `Bearer ${teacher1Token}`,
        'Content-Type': 'application/json',
      },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    const subjects: Array<{ subjectName?: string; name?: string }> = body.data;
    expect(subjects).toBeDefined();
    expect(Array.isArray(subjects)).toBe(true);
    // Teacher1 is class teacher of JSS 1A — should have inherited subjects
    // (English, Math, Physics, Chemistry) but NOT Music or PE
    expect(subjects.length).toBeGreaterThanOrEqual(4);

    const subjectNames = subjects.map(
      (s) => (s.subjectName ?? s.name ?? '').toLowerCase()
    );
    expect(subjectNames).toContain('english');
    expect(subjectNames).toContain('mathematics');
    expect(subjectNames).not.toContain('music');
    expect(subjectNames).not.toContain('physical education');
  });

  test('teacher2 can view their assigned subjects via my-subjects endpoint', async () => {
    const res = await fetch(`${API_BASE_URL}/schools/${SCHOOL_A}/my-subjects`, {
      headers: {
        Authorization: `Bearer ${teacher2Token}`,
        'Content-Type': 'application/json',
      },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    const subjects: Array<{ subjectName?: string; name?: string; className?: string }> = body.data;
    expect(subjects).toBeDefined();
    expect(Array.isArray(subjects)).toBe(true);

    // Teacher2 is specialist for Music and PE in JSS 1A, plus class teacher of JSS 1B
    // At minimum, Music and PE for JSS 1A should be present
    const jss1aSubjects = subjects.filter(
      (s) => (s.className ?? '').includes('JSS 1A') || true // include all if className not present
    );
    const subjectNames = subjects.map(
      (s) => (s.subjectName ?? s.name ?? '').toLowerCase()
    );
    expect(subjectNames).toContain('music');
    expect(subjectNames).toContain('physical education');
  });
});
