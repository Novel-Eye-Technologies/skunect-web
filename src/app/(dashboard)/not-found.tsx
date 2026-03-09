'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchoolDetailClient } from '@/components/features/schools/school-detail-client';
import { StudentDetailClient } from '@/components/features/students/student-detail-client';
import { HomeworkDetailClient } from '@/components/features/homework/homework-detail-client';

/**
 * Dashboard-level not-found handler.
 *
 * With `output: 'export'`, dynamic routes (e.g. /system/schools/[schoolId])
 * only pre-render a placeholder param ('_'). CloudFront rewrites unknown
 * UUIDs to the '_' page, but the App Router may reject params not in
 * generateStaticParams and trigger not-found.  This component intercepts
 * those cases and renders the correct detail page within the dashboard layout.
 */
export default function DashboardNotFound() {
  const pathname = usePathname();

  // Match dynamic route patterns and render the appropriate client component.
  if (/^\/system\/schools\/[^/]+/.test(pathname)) return <SchoolDetailClient />;
  if (/^\/students\/[^/]+/.test(pathname)) return <StudentDetailClient />;
  if (/^\/homework\/[^/]+/.test(pathname)) return <HomeworkDetailClient />;

  // Genuine 404 within the dashboard
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild variant="outline" className="mt-6 gap-2">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
