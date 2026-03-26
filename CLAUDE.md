# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                             # Dev server (localhost:3000)
npm run build                           # Static export to out/
npm run lint                            # ESLint
npm run test:e2e                        # Playwright E2E tests (against dev.skunect.com)
npm run test:e2e:ui                     # Interactive Playwright UI
npx playwright test path/to/spec.ts    # Single E2E test file
E2E_BASE_URL=http://localhost:3000 npm run test:e2e  # E2E against local dev
npm run api:sync                        # Regenerate API types from backend OpenAPI spec
```

After code changes, run E2E tests against local dev to verify no regressions.

## API Type Generation

Backend types are auto-generated from the OpenAPI spec using `openapi-typescript`.

- **Spec**: `src/lib/api/openapi.json` — downloaded from backend `/api-docs` endpoint
- **Generated types**: `src/lib/api/generated-types.ts` — DO NOT edit manually
- **Schema helper**: `src/lib/api/schema.ts` — re-exports with `Api['SchemaName']` shorthand
- **Sync command**: `npm run api:sync` — fetches spec and regenerates types
- **CI check**: The E2E full workflow verifies types are in sync with the running backend

When backend DTOs change, run `npm run api:sync` and commit the updated files. CI will fail if types drift.

## Architecture

**Static-export Next.js 15 app** (App Router) — all pages are client-side rendered with `'use client'`. Production builds go to `out/` for S3 + CloudFront hosting.

### Route Groups
- `src/app/(auth)/` — Public pages: login, register, verify-otp, select-school
- `src/app/(dashboard)/` — Protected pages wrapped by `AuthProvider` which validates JWT via `GET /api/v1/auth/me` and enforces role-based access

### State Management (Zustand)
- **auth-store** (`skunect-auth` in localStorage) — tokens, user, currentSchoolId, currentRole, `_hydrated` flag. Multi-school users get school selector; `setCurrentSchool()` updates role context
- **child-store** (`skunect-child-store`) — Parent's children list and selected child for scoped views
- **ui-store** (not persisted) — Sidebar collapse state

All stores use a `_hydrated` flag pattern — components/providers must wait for hydration before reading persisted state.

### API Layer (`src/lib/api/`)
- **client.ts** — Axios instance with Bearer token injection and silent 401 token refresh (queues requests during refresh to avoid races)
- **types.ts** — Standard envelope: `ApiResponse<T> { status, message, data, errors, meta }`
- **30+ domain modules** — Each exports typed functions calling `apiClient`. Most endpoints are scoped under `/schools/{schoolId}/...`
- Pagination convention: `?page=0&size=20&sort=createdAt&direction=DESC`

### Providers (`src/lib/providers/`)
Root layout wraps app in: `ThemeProvider` → `QueryProvider` (staleTime: 5min, retry: 1) → `TooltipProvider` + `Toaster`

`AuthProvider` runs only inside `(dashboard)` layout — validates tokens, redirects unauthorized roles.

### Role-Based Access
Four roles: `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `PARENT`

- Navigation sidebar filtered by `navigationConfig` in `src/lib/utils/navigation.ts` (each `NavItem` has `roles` array)
- `ADMIN_ONLY_ROUTES` and `SUPER_ADMIN_ONLY_ROUTES` defined in `src/lib/constants.ts`
- Lower-privileged users accessing restricted routes get redirected to `/dashboard`
- SUPER_ADMIN has no school scope; other roles always operate within `currentSchoolId`

### Auth Flow
Passwordless: Email/Phone → OTP (`123456` in dev) → JWT tokens stored in Zustand → AuthProvider validates on protected routes. Google OAuth also supported.

## E2E Testing

Uses Playwright with Page Object Model pattern.

### Key Structure
- `e2e/global-setup.ts` — Seeds DB via SUPER_ADMIN, authenticates all test accounts, saves storageState to `.auth/*.json`
- `e2e/fixtures/auth.fixture.ts` — Pre-authenticated page fixtures: `adminPage`, `teacherPage`, `parentPage`, `superAdminPage`, `teacherParentPage` (dual-role), cross-school variants
- `e2e/fixtures/test-accounts.ts` — All test accounts with expected roles, nav items, and blocked routes
- `e2e/pages/` — 43 Page Object Models encapsulating UI interactions
- `e2e/helpers/api.helper.ts` — Raw fetch API helpers for test setup (no browser needed)

### Test Tenancy
Two test schools: Kings Academy Lagos and Greenfield International. Tests verify data isolation across tenants and handle dual-role/cross-school users.

```typescript
// Usage pattern in specs:
import { test, expect } from '../../fixtures/auth.fixture'

test('admin can view students', async ({ adminPage }) => {
  await adminPage.goto('/students')
  await expect(adminPage.locator('h1')).toContainText('Students')
})
```

## Key Conventions

- **Path alias:** `@/*` maps to `./src/*`
- **Component organization:** `src/components/ui/` (shadcn primitives), `src/components/features/` (domain), `src/components/shared/` (reusable), `src/components/layout/`
- **Forms:** React Hook Form + Zod schemas for validation
- **Icons:** Lucide React
- **Charts:** Recharts
- **Toasts:** Sonner via `toast()` from `sonner`
- **WebSocket:** STOMP protocol via `@stomp/stompjs` for real-time messaging
- **Static export constraints:** No server-side features (no API routes, no SSR, no middleware). All data fetching happens client-side via React Query
- **ESLint:** Ignores `e2e/` and `out/` directories. Allows empty object types and `_`-prefixed unused vars
