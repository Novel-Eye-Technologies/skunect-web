'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { useRemoveUser } from '@/lib/hooks/use-users';
import type { UserListItem } from '@/lib/types/user';

interface UserStatusDialogProps {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserStatusDialog({
  user,
  open,
  onOpenChange,
}: UserStatusDialogProps) {
  const removeUser = useRemoveUser();

  function handleDeactivate() {
    if (!user) return;

    removeUser.mutate(user.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  if (!user) return null;

  const isActive = user.status === 'ACTIVE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Deactivate User</DialogTitle>
          <DialogDescription>
            {isActive
              ? `Deactivate ${user.firstName} ${user.lastName} from this school.`
              : `${user.firstName} ${user.lastName} is already inactive.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <span className="text-sm font-medium">Current Status</span>
            <div>
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {isActive && (
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={removeUser.isPending}
            >
              {removeUser.isPending ? 'Deactivating...' : 'Deactivate User'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
