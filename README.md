# Skunect Web

Frontend for the Skunect School Management Platform, built with Next.js 15, React 19, shadcn/ui, and Tailwind CSS.

**Live:** [`https://skunect.com`](https://skunect.com) | **API:** [`https://api.skunect.com`](https://api.skunect.com)

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Features by Role](#features-by-role)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [State Management](#state-management)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Testing](#testing)
- [Test Accounts](#test-accounts)

---

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or pnpm

### Run Locally

```bash
# Clone the repo
git clone https://github.com/Novel-Eye-Technologies/skunect-web.git
cd skunect-web

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
# Build (static export)
npm run build

# Preview the static build
npx serve out
```

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.1.6 (App Router, Static Export) |
| UI Library | React 19 |
| Component Library | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS 4 |
| State Management | Zustand (persisted to localStorage) |
| Data Fetching | TanStack React Query + Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Forms | React Hook Form + Zod validation |
| Language | TypeScript 5 |

### Design Principles

- **Static Export** (`output: 'export'`) — deployed to S3 + CloudFront as static files
- **Client-Side Rendering** — all pages use `'use client'` with Zustand for auth state
- **Role-Based Navigation** — sidebar and routes filtered by user's current role
- **Multi-Tenancy** — school context managed via auth store, passed to API calls
- **Standardized API Layer** — all API calls return `ApiResponse<T>` envelope

---

## Features by Role

### Super Admin (`SUPER_ADMIN`)
- System-wide dashboard with aggregate stats across all schools
- All Schools management page
- Seed data reset for testing
- No school-scoped data — platform-level access

### School Admin (`ADMIN`)
- School dashboard with student/teacher/attendance/fee stats
- School settings (general, sessions/terms, classes, subjects, grading systems)
- User management (invite, assign roles)
- Student enrollment and management
- Academics (assessments, grade entry, report cards)
- Attendance tracking
- Homework management
- Fee structures and invoices
- Communication (messages, announcements, notifications)
- Safety (emergency alerts, pickup authorization)
- Analytics (attendance, academic, fees)
- Data migration (CSV/Excel import)

### Teacher (`TEACHER`)
- Teacher dashboard
- Student list (assigned classes)
- Academics (assessments, grade entry, report cards)
- Attendance marking
- Homework (create, grade submissions)
- Communication
- Analytics (attendance, academic for assigned classes)

### Parent (`PARENT`)
- Parent dashboard (children overview, attendance, fees, homework)
- My Children page
- Homework tracking
- Fee invoices
- Communication (messages, announcements, notifications)

---

## Project Structure

```
skunect-web/
├── .github/workflows/          # CI/CD pipeline
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth pages (login, register, verify-otp, select-school)
│   │   ├── (dashboard)/        # Protected pages (dashboard, students, users, etc.)
│   │   │   ├── dashboard/      # Role-specific dashboards
│   │   │   ├── system/         # Super Admin system pages (schools, seed)
│   │   │   ├── school-settings/# Admin school configuration
│   │   │   ├── students/       # Student management
│   │   │   ├── users/          # User management
│   │   │   ├── academics/      # Assessments, grades, report cards
│   │   │   ├── attendance/     # Attendance tracking
│   │   │   ├── homework/       # Homework management
│   │   │   ├── fees/           # Fee structures and invoices
│   │   │   ├── communication/  # Messages, announcements, notifications
│   │   │   ├── safety/         # Emergency alerts, pickup
│   │   │   ├── analytics/      # Dashboard analytics
│   │   │   └── data-migration/ # CSV/Excel import
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── features/           # Domain-specific components
│   │   │   ├── auth/           # Login, register, OTP forms
│   │   │   ├── dashboard/      # Admin, Teacher, Parent, Super Admin dashboards
│   │   │   ├── students/       # Student list, detail, forms
│   │   │   ├── school-settings/# Settings forms and tables
│   │   │   └── ...             # Other feature components
│   │   ├── layout/             # Sidebar, header, school switcher
│   │   ├── shared/             # Reusable: PageHeader, StatCard, DataTable
│   │   └── ui/                 # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── lib/
│   │   ├── api/                # API client modules (auth, schools, students, admin, etc.)
│   │   ├── providers/          # AuthProvider (token validation, route guards)
│   │   ├── stores/             # Zustand stores (auth-store, ui-store)
│   │   ├── types/              # TypeScript interfaces (auth, admin, school, student, etc.)
│   │   └── utils/              # Constants, navigation config, helpers
│   └── styles/                 # Global CSS
├── next.config.ts              # Next.js config (static export, API rewrites)
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## Authentication

### Auth Flow

1. User enters email on login page
2. Backend sends OTP (in dev mode, OTP is always `123456`)
3. User enters OTP on verification page
4. Backend returns JWT access token + refresh token + user info
5. Tokens stored in Zustand (persisted to localStorage via `skunect-auth` key)
6. `AuthProvider` validates token on each page load via `GET /api/v1/auth/me`
7. Axios interceptor auto-refreshes expired tokens

### Route Protection

- **Public routes:** `/login`, `/register`, `/verify-otp`, `/forgot-password`
- **ADMIN-only routes:** `/school-settings`, `/users`, `/fees`, `/data-migration`, `/safety/emergency-alerts`
- **SUPER_ADMIN-only routes:** `/system/*`
- All other dashboard routes require authentication

### Multi-School Support

Users with roles at multiple schools see a school selector after login. The selected school determines the API context (`schoolId` in API calls) and which navigation items appear.

Special cases:
- **SUPER_ADMIN** — no school context needed, sees system-wide data
- **Cross-school parents** — can switch between schools to view different children
- **Dual-role users** — e.g., Teacher at School A + Parent at School B

---

## State Management

### Auth Store (`useAuthStore`)

```typescript
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  currentSchoolId: string | null;
  currentRole: Role | null; // 'ADMIN' | 'TEACHER' | 'PARENT' | 'SUPER_ADMIN'
}
```

Key behaviors:
- `setUser()` — auto-detects SUPER_ADMIN (sets null schoolId), otherwise selects first school
- `setCurrentSchool()` — no-op for SUPER_ADMIN
- `isSuperAdmin()` — helper for role checks
- Persisted to `localStorage` under key `skunect-auth`

### UI Store (`useUIStore`)

```typescript
interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}
```

---

## Configuration

### Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_API_URL=https://api.skunect.com/api/v1
```

For production, this is set in `.env.production`.

---

## Deployment

### AWS Infrastructure

| Resource | Details |
|----------|---------|
| **S3** | `skunect-web-dev` — static file hosting |
| **CloudFront** | Distribution `EUW2XYFIEOP1A` — CDN with HTTPS |
| **Route 53** | `skunect.com` → CloudFront |
| **ACM** | SSL certificate for `skunect.com` |

### Manual Deploy

```bash
# Build
npm run build

# Sync to S3
aws s3 sync out/ s3://skunect-web-dev --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id EUW2XYFIEOP1A --paths "/*"
```

### CI/CD

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PR to `develop` or `main` | Lint + typecheck |
| `e2e-tests.yml` | PR to `develop`/`main`, push to `develop` | E2E tests (sharded, against dev) |
| `e2e-full.yml` | PR to `develop`/`main`, push to `develop` | Full E2E with Docker backend |
| `deploy-dev.yml` | Push to `develop` | Build + deploy to dev environment |
| `deploy-prod.yml` | Push to `main` | E2E tests + deploy to production |

### Release Process

1. **Development**: Feature branches → PR to `develop` → auto-deploys to dev after merge
2. **Version tag**: When dev is stable, tag the release:
   ```bash
   git checkout develop
   git tag v1.1.0
   git push origin v1.1.0
   ```
3. **Promote to prod**: Create PR from `develop` → `main`, include the version in PR title
4. **Production deploy**: Merging to `main` runs E2E tests, then auto-deploys to production
5. **Rollback**: Redeploy a previous git tag:
   ```bash
   git checkout v1.0.0
   npm run build
   aws s3 sync out/ s3://skunect-web-dev --delete
   aws cloudfront create-invalidation --distribution-id EUW2XYFIEOP1A --paths "/*"
   ```

### Version Convention

- Format: `v{major}.{minor}.{patch}` (e.g., `v1.2.0`)
- **Patch**: bug fixes, no UI changes
- **Minor**: new features, backwards-compatible
- **Major**: breaking changes, major UI overhaul

---

## Testing

### E2E Tests (Playwright)

E2E tests run against the deployed app by default (`https://dev.skunect.com`). To run locally, you need both the API and web dev server running.

#### Prerequisites

1. **Start the backend API** (from the `Skunect-api` directory):

```bash
cd ../Skunect-api
docker compose up -d postgres    # Start PostgreSQL
./gradlew bootRun                # Start API on localhost:8080
```

2. **Start the web dev server** (from this directory):

```bash
npm run dev                      # Start Next.js on localhost:3000
```

3. **Install Playwright browsers** (first time only):

```bash
npx playwright install chromium
```

#### Running Tests

```bash
# Run against deployed app (default)
npm run test:e2e

# Run against local dev servers
E2E_BASE_URL=http://localhost:3000 E2E_API_URL=http://localhost:8080/api/v1 npm run test:e2e

# Run a single test file
E2E_BASE_URL=http://localhost:3000 E2E_API_URL=http://localhost:8080/api/v1 npx playwright test e2e/specs/navigation/sidebar-navigation.spec.ts

# Run with UI mode (interactive)
E2E_BASE_URL=http://localhost:3000 E2E_API_URL=http://localhost:8080/api/v1 npx playwright test --ui

# View the HTML test report after a run
npx playwright show-report
```

#### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_BASE_URL` | `https://dev.skunect.com` | Web app URL for browser navigation |
| `E2E_API_URL` | `{E2E_BASE_URL}/api/v1` | API URL for test setup (auth, seed) |

#### School Lifecycle E2E Flow

The `e2e/specs/flows/school-lifecycle.spec.ts` test exercises the **full school management lifecycle** across Super Admin, School Admin, and Teacher roles. It runs as a serial test suite (27 tests) and covers:

- **Super Admin:** Create school, update details, add admin, verify school detail page
- **School Admin:** Create second admin, 3 teachers, session, term, 2 classes, 5 subjects, grading system, 10 students with parents, timetable, validate dashboard and People pages
- **Teacher:** Login and validate dashboard

```bash
# Run the lifecycle flow against local servers
E2E_BASE_URL=http://localhost:3000 E2E_API_URL=http://localhost:8080/api/v1 \
  npx playwright test e2e/specs/flows/school-lifecycle.spec.ts --workers=1

# Run with headed browser (useful for debugging)
E2E_BASE_URL=http://localhost:3000 E2E_API_URL=http://localhost:8080/api/v1 \
  npx playwright test e2e/specs/flows/school-lifecycle.spec.ts --workers=1 --headed

# Run via Docker (full stack, fresh DB — same as CI)
docker compose -f e2e/docker/docker-compose.yml up -d
# Wait for backend health check...
E2E_BASE_URL=http://localhost:3000 E2E_API_URL=http://localhost:3000/api/v1 \
  npx playwright test e2e/specs/flows/school-lifecycle.spec.ts --workers=1
docker compose -f e2e/docker/docker-compose.yml down -v
```

> **Note:** This test must run with `--workers=1` because the tests are serial and share state across steps.

#### Test Structure

```
e2e/
├── fixtures/           # Auth fixture, test accounts
├── helpers/            # API helpers (direct fetch calls for setup)
├── pages/              # Page Object Models (sidebar, login, etc.)
├── specs/              # Test specs organized by feature
│   ├── admin/          # Admin-specific tests
│   ├── auth/           # Login, logout, route protection
│   ├── flows/          # End-to-end lifecycle flows (serial)
│   ├── navigation/     # Sidebar navigation tests
│   ├── teacher/        # Teacher-specific tests
│   └── welfare/        # Welfare feature tests
├── global-setup.ts     # Authenticates all test accounts before tests
└── global-teardown.ts  # Cleanup after tests
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

---

## Test Accounts

All test accounts use OTP `123456` (dev mode). Login at [`https://skunect.com`](https://skunect.com).

| Email | Role | Scenario |
|-------|------|----------|
| `superadmin@skunect.com` | SUPER_ADMIN | Platform administrator |
| `admin@kingsacademy.ng` | ADMIN @ Kings Academy | School admin |
| `admin@greenfield.edu.ng` | ADMIN @ Greenfield International | Second school admin |
| `teacher1@kingsacademy.ng` | TEACHER @ Kings Academy | Teacher |
| `teacher1@greenfield.edu.ng` | TEACHER @ Greenfield International | Teacher |
| `parent1@example.com` | PARENT @ Kings Academy | 2 children, same school |
| `parent2@example.com` | PARENT @ Kings + Greenfield | Cross-school parent |
| `parent3@example.com` | PARENT @ Greenfield | Single school parent |
| `teacher.parent@example.com` | TEACHER @ Kings + PARENT @ Greenfield | Dual-role, cross-school |
