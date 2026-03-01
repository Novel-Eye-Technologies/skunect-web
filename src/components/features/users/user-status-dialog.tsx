'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/shared/status-badge';
import { useUpdateUserStatus } from '@/lib/hooks/use-users';
import type { UserListItem } from '@/lib/types/user';

interface UserStatusDialogProps {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusOptions = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const;

export function UserStatusDialog({
  user,
  open,
  onOpenChange,
}: UserStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const updateStatus = useUpdateUserStatus();

  // Reset selected status when dialog opens with a new user
  function handleOpenChange(value: boolean) {
    if (value && user) {
      setSelectedStatus(user.status);
    }
    onOpenChange(value);
  }

  function handleConfirm() {
    if (!user || !selectedStatus) return;

    updateStatus.mutate(
      {
        userId: user.id,
        data: { status: selectedStatus as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change User Status</DialogTitle>
          <DialogDescription>
            Update the status for {user.firstName} {user.lastName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div>
              <StatusBadge status={user.status} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-status">New Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger id="new-status">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              updateStatus.isPending ||
              selectedStatus === user.status ||
              !selectedStatus
            }
          >
            {updateStatus.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
