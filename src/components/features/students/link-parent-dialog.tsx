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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2 } from 'lucide-react';
import { useUsers } from '@/lib/hooks/use-users';
import { useLinkParent } from '@/lib/hooks/use-students';
import type { UserListItem } from '@/lib/types/user';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const linkExistingSchema = z.object({
  parentUserId: z.string().min(1, 'Please select a parent'),
  relationship: z.string().min(1, 'Please select a relationship'),
});

const createNewSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  relationship: z.string().min(1, 'Please select a relationship'),
});

type LinkExistingFormValues = z.infer<typeof linkExistingSchema>;
type CreateNewFormValues = z.infer<typeof createNewSchema>;

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
  const [tab, setTab] = useState<string>('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  const { data: usersResponse, isLoading: isSearching } = useUsers({
    page: 0,
    size: 20,
    status: 'ACTIVE',
  });

  const linkParent = useLinkParent();

  const existingForm = useForm<LinkExistingFormValues>({
    resolver: zodResolver(linkExistingSchema),
    defaultValues: { parentUserId: '', relationship: '' },
  });

  const createForm = useForm<CreateNewFormValues>({
    resolver: zodResolver(createNewSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', relationship: '' },
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
    existingForm.setValue('parentUserId', user.id);
  }

  function onSubmitExisting(values: LinkExistingFormValues) {
    linkParent.mutate(
      {
        studentId,
        data: {
          parentUserId: values.parentUserId,
          relationship: values.relationship,
        },
      },
      { onSuccess: handleClose },
    );
  }

  function onSubmitNew(values: CreateNewFormValues) {
    linkParent.mutate(
      {
        studentId,
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          relationship: values.relationship,
        },
      },
      { onSuccess: handleClose },
    );
  }

  function handleClose() {
    existingForm.reset();
    createForm.reset();
    setSelectedUser(null);
    setSearchTerm('');
    setTab('existing');
    onOpenChange(false);
  }

  function handleOpenChange(value: boolean) {
    if (!value) handleClose();
    else onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Link Parent</DialogTitle>
          <DialogDescription>
            Link an existing user or create a new parent account.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Search Existing</TabsTrigger>
            <TabsTrigger value="new">Create New</TabsTrigger>
          </TabsList>

          {/* --- Link Existing Tab --- */}
          <TabsContent value="existing">
            <Form {...existingForm}>
              <form onSubmit={existingForm.handleSubmit(onSubmitExisting)} className="space-y-4">
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
                          selectedUser?.id === user.id ? 'bg-accent' : ''
                        }`}
                      >
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </button>
                    ))
                  )}
                </div>

                <FormField
                  control={existingForm.control}
                  name="parentUserId"
                  render={() => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...existingForm.register('parentUserId')} />
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
                  control={existingForm.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {relationships.map((rel) => (
                            <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={linkParent.isPending}>
                    {linkParent.isPending ? 'Linking...' : 'Link Parent'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* --- Create New Tab --- */}
          <TabsContent value="new">
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onSubmitNew)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="parent@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+234 800 000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {relationships.map((rel) => (
                            <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={linkParent.isPending}>
                    {linkParent.isPending ? 'Creating...' : 'Create & Link Parent'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
