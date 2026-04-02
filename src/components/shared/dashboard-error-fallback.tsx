'use client';

import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <img src="/logo.png" alt="Skunect" className="w-16 h-16 rounded-2xl mb-6" />

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred. Please reload the page or contact support
          if the problem persists.
        </p>

        <Button
          className="gap-2 bg-navy hover:bg-navy/90 text-white"
          onClick={() => window.location.reload()}
        >
          <RotateCw className="w-4 h-4" />
          Reload page
        </Button>
      </div>
    </div>
  );
}
