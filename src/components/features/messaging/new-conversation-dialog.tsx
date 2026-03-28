'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useContacts } from '@/lib/hooks/use-users';
import { useCreateConversation, useSendMessage } from '@/lib/hooks/use-messaging';
import type { UserListItem } from '@/lib/types/user';

const newConversationSchema = z.object({
  recipientId: z.string().min(1, { message: 'Please select a recipient' }),
  message: z.string().min(1, { message: 'Please enter a message' }),
});

type NewConversationValues = z.infer<typeof newConversationSchema>;

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const userId = useAuthStore((s) => s.user?.id);
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  const { data: usersResponse, isLoading: usersLoading } = useContacts({
    size: 50,
  });

  const createConversation = useCreateConversation();
  const sendMsg = useSendMessage();

  const form = useForm<NewConversationValues>({
    resolver: zodResolver(newConversationSchema),
    defaultValues: {
      recipientId: '',
      message: '',
    },
  });

  const selectedRecipientId = form.watch('recipientId');

  // Filter users: exclude self, apply search
  const allUsers = usersResponse?.data ?? [];
  const filteredUsers = allUsers.filter((user) => {
    if (user.id === userId) return false;
    if (!searchQuery) return true;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  function selectRecipient(user: UserListItem) {
    form.setValue('recipientId', user.id, { shouldValidate: true });
  }

  function onSubmit(values: NewConversationValues) {
    createConversation.mutate(
      {
        type: 'DIRECT',
        schoolId: schoolId!,
        participantIds: [values.recipientId],
      },
      {
        onSuccess: (response) => {
          const conversationId = response.data.id;
          sendMsg.mutate(
            {
              conversationId,
              data: { content: values.message },
            },
            {
              onSettled: () => {
                form.reset();
                setSearchQuery('');
                onOpenChange(false);
                onConversationCreated?.(conversationId);
              },
            },
          );
        },
      },
    );
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      form.reset();
      setSearchQuery('');
    }
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Select a user and send your first message.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Search users */}
            <div className="space-y-2">
              <FormLabel>Recipient</FormLabel>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* User list */}
            <FormField
              control={form.control}
              name="recipientId"
              render={() => (
                <FormItem>
                  <ScrollArea className="h-[200px] rounded-md border">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No users found.
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => selectRecipient(user)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                              selectedRecipientId === user.id &&
                                'bg-accent ring-1 ring-primary',
                            )}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" />
                              <AvatarFallback className="text-xs">
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {user.roles?.map((r) => r.role).join(', ') || '—'} &middot; {user.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your message..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createConversation.isPending || sendMsg.isPending}>
                {createConversation.isPending || sendMsg.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
