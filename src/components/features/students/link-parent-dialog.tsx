'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { useUsers } from '@/lib/hooks/use-users';
import { useLinkParent } from '@/lib/hooks/use-students';
import type { UserListItem } from '@/lib/types/user';

const linkParentSchema = z.object({
  parentUserId: z.string().min(1, 'Please select a parent'),
  relationship: z.string().min(1, 'Please select a relationship'),
});

type LinkParentFormValues = z.infer<typeof linkParentSchema>;

interface LinkParentDialogProps {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const relationships = ['Father', 'Mother', 'Guardian', 'Other'] as const;

export function LinkParentDialog({
  studentId,
  open,
  onOpenChange,
}: LinkParentDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  const { data: usersResponse, isLoading: isSearching } = useUsers({
    page: 0,
    size: 20,
    status: 'ACTIVE',
  });

  const linkParent = useLinkParent();

  const form = useForm<LinkParentFormValues>({
    resolver: zodResolver(linkParentSchema),
    defaultValues: {
      parentUserId: '',
      relationship: '',
    },
  });

  // Filter users by search term on the client
  const users = (usersResponse?.data ?? []).filter((user) => {
    if (!searchTerm) return true;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });

  function handleSelectUser(user: UserListItem) {
    setSelectedUser(user);
    form.setValue('parentUserId', user.id);
  }

  function onSubmit(values: LinkParentFormValues) {
    linkParent.mutate(
      {
        studentId,
        data: {
          parentUserId: values.parentUserId,
          relationship: values.relationship,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          setSelectedUser(null);
          setSearchTerm('');
          onOpenChange(false);
        },
      },
    );
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      form.reset();
      setSelectedUser(null);
      setSearchTerm('');
    }
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Link Parent</DialogTitle>
          <DialogDescription>
            Search for an existing user to link as a parent or guardian.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search User</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* User list */}
            <div className="max-h-[200px] space-y-1 overflow-y-auto rounded-md border p-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No users found.
                </p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                      selectedUser?.id === user.id
                        ? 'bg-accent'
                        : ''
                    }`}
                  >
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </button>
                ))
              )}
            </div>

            <FormField
              control={form.control}
              name="parentUserId"
              render={() => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...form.register('parentUserId')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedUser && (
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{selectedUser.firstName} {selectedUser.lastName}</span>
              </p>
            )}

            {/* Relationship */}
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relationships.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={linkParent.isPending}>
                {linkParent.isPending ? 'Linking...' : 'Link Parent'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
