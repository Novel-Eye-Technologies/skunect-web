'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function SessionExpiryModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { sessionExpired, setSessionExpired, logout } = useAuthStore();

  const handleContinue = () => {
    // Clear the modal state
    setSessionExpired(false);
    
    // Log the user out completely (AuthProvider will handle the redirect with returnUrl)
    logout();
  };

  return (
    <Dialog open={sessionExpired} onOpenChange={() => {
      // Prevent closing by clicking outside or pressing Escape
    }}>
      <DialogContent className="sm:max-w-md [&>button]:hidden text-center sm:text-left">
        <DialogHeader>
          <div className="mx-auto mt-4 mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 sm:mx-0">
            <LogOut className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <DialogTitle className="text-xl">Session Expired</DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Your login session has expired or is invalid. Please log in again to continue accessing your dashboard without losing your place.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 sm:justify-end">
          <Button onClick={handleContinue} className="w-full sm:w-auto">
            Log In Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
