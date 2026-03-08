'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import {
  useSessions,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
  useSetCurrentSession,
  useTerms,
  useCreateTerm,
  useUpdateTerm,
  useDeleteTerm,
  useSetCurrentTerm,
} from '@/lib/hooks/use-school-settings';
import type { AcademicSession, Term } from '@/lib/types/school';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const sessionSchema = z.object({
  name: z.string().min(2, 'Session name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

const termSchema = z.object({
  name: z.string().min(2, 'Term name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type TermFormValues = z.infer<typeof termSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionsTermsManager() {
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  const setCurrentSession = useSetCurrentSession();

  const [selectedSession, setSelectedSession] =
    useState<AcademicSession | null>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [editingSession, setEditingSession] =
    useState<AcademicSession | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  // Term state
  const [termDialogOpen, setTermDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [deleteTermId, setDeleteTermId] = useState<string | null>(null);

  const { data: terms, isLoading: termsLoading } = useTerms(
    selectedSession?.id ?? '',
  );
  const createTerm = useCreateTerm();
  const updateTerm = useUpdateTerm();
  const deleteTerm = useDeleteTerm();
  const setCurrentTerm = useSetCurrentTerm();

  // ---------------------------------------------------------------------------
  // Session form
  // ---------------------------------------------------------------------------

  const sessionForm = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { name: '', startDate: '', endDate: '' },
  });

  function openCreateSession() {
    setEditingSession(null);
    sessionForm.reset({ name: '', startDate: '', endDate: '' });
    setSessionDialogOpen(true);
  }

  function openEditSession(session: AcademicSession) {
    setEditingSession(session);
    sessionForm.reset({
      name: session.name,
      startDate: session.startDate.split('T')[0],
      endDate: session.endDate.split('T')[0],
    });
    setSessionDialogOpen(true);
  }

  function onSessionSubmit(values: SessionFormValues) {
    if (editingSession) {
      updateSession.mutate(
        { sessionId: editingSession.id, data: values },
        { onSuccess: () => setSessionDialogOpen(false) },
      );
    } else {
      createSession.mutate(values, {
        onSuccess: () => setSessionDialogOpen(false),
      });
    }
  }

  function confirmDeleteSession() {
    if (!deleteSessionId) return;
    deleteSession.mutate(deleteSessionId, {
      onSuccess: () => {
        if (selectedSession?.id === deleteSessionId) {
          setSelectedSession(null);
        }
        setDeleteSessionId(null);
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Term form
  // ---------------------------------------------------------------------------

  const termForm = useForm<TermFormValues>({
    resolver: zodResolver(termSchema),
    defaultValues: { name: '', startDate: '', endDate: '' },
  });

  function openCreateTerm() {
    setEditingTerm(null);
    termForm.reset({ name: '', startDate: '', endDate: '' });
    setTermDialogOpen(true);
  }

  function openEditTerm(term: Term) {
    setEditingTerm(term);
    termForm.reset({
      name: term.name,
      startDate: term.startDate.split('T')[0],
      endDate: term.endDate.split('T')[0],
    });
    setTermDialogOpen(true);
  }

  function onTermSubmit(values: TermFormValues) {
    if (!selectedSession) return;

    const sessionStart = selectedSession.startDate.split('T')[0];
    const sessionEnd = selectedSession.endDate.split('T')[0];

    if (values.startDate < sessionStart) {
      toast.error(`Term start date cannot be before session start (${sessionStart})`);
      return;
    }
    if (values.endDate > sessionEnd) {
      toast.error(`Term end date cannot be after session end (${sessionEnd})`);
      return;
    }

    // Check for overlap with other terms in the same session
    const otherTerms = (terms ?? []).filter(
      (t) => !editingTerm || t.id !== editingTerm.id,
    );
    const overlapping = otherTerms.find((t) => {
      const existingStart = t.startDate.split('T')[0];
      const existingEnd = t.endDate.split('T')[0];
      return values.startDate < existingEnd && values.endDate > existingStart;
    });
    if (overlapping) {
      toast.error(
        `Dates overlap with "${overlapping.name}" (${overlapping.startDate.split('T')[0]} — ${overlapping.endDate.split('T')[0]})`,
      );
      return;
    }

    if (editingTerm) {
      updateTerm.mutate(
        {
          termId: editingTerm.id,
          data: { ...values, sessionId: selectedSession.id },
        },
        { onSuccess: () => setTermDialogOpen(false) },
      );
    } else {
      createTerm.mutate(
        { ...values, sessionId: selectedSession.id },
        { onSuccess: () => setTermDialogOpen(false) },
      );
    }
  }

  function confirmDeleteTerm() {
    if (!deleteTermId || !selectedSession) return;
    deleteTerm.mutate(
      { termId: deleteTermId, sessionId: selectedSession.id },
      { onSuccess: () => setDeleteTermId(null) },
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (sessionsLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sessions Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Academic Sessions</CardTitle>
              <CardDescription>
                Manage your school&apos;s academic sessions.
              </CardDescription>
            </div>
            <Button size="sm" onClick={openCreateSession}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            {!sessions || sessions.length === 0 ? (
              <EmptyState
                title="No sessions"
                description="Create your first academic session to get started."
                icon={CalendarDays}
                action={
                  <Button size="sm" onClick={openCreateSession}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add Session
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                      selectedSession?.id === session.id
                        ? 'border-primary bg-muted/50'
                        : ''
                    }`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.name}</span>
                          {session.isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.startDate).toLocaleDateString()} —{' '}
                          {new Date(session.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!session.isCurrent && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Set as current"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentSession.mutate(session.id);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditSession(session);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteSessionId(session.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>
                {selectedSession
                  ? `Terms — ${selectedSession.name}`
                  : 'Terms'}
              </CardTitle>
              <CardDescription>
                {selectedSession
                  ? 'Manage terms within this session.'
                  : 'Select a session to view its terms.'}
              </CardDescription>
            </div>
            {selectedSession && (
              <Button size="sm" onClick={openCreateTerm}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedSession ? (
              <EmptyState
                title="No session selected"
                description="Click on a session to view and manage its terms."
                icon={CalendarDays}
              />
            ) : termsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !terms || terms.length === 0 ? (
              <EmptyState
                title="No terms"
                description="Add terms to this academic session."
                icon={CalendarDays}
                action={
                  <Button size="sm" onClick={openCreateTerm}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add Term
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {terms.map((term) => (
                  <div
                    key={term.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{term.name}</span>
                          {term.isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(term.startDate).toLocaleDateString()} —{' '}
                          {new Date(term.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!term.isCurrent && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Set as current"
                            onClick={() =>
                              setCurrentTerm.mutate({
                                termId: term.id,
                                sessionId: selectedSession.id,
                              })
                            }
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditTerm(term)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteTermId(term.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---- Session Dialog ---- */}
      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSession ? 'Edit Session' : 'Add Session'}
            </DialogTitle>
            <DialogDescription>
              {editingSession
                ? 'Update the academic session details.'
                : 'Create a new academic session.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...sessionForm}>
            <form
              onSubmit={sessionForm.handleSubmit(onSessionSubmit)}
              className="space-y-4"
            >
              <FormField
                control={sessionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2024/2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={sessionForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sessionForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSessionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createSession.isPending || updateSession.isPending
                  }
                >
                  {(createSession.isPending || updateSession.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingSession ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---- Term Dialog ---- */}
      <Dialog open={termDialogOpen} onOpenChange={setTermDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTerm ? 'Edit Term' : 'Add Term'}
            </DialogTitle>
            <DialogDescription>
              {editingTerm
                ? 'Update the term details.'
                : `Add a new term to ${selectedSession?.name ?? 'session'}.`}
            </DialogDescription>
          </DialogHeader>
          <Form {...termForm}>
            <form
              onSubmit={termForm.handleSubmit(onTermSubmit)}
              className="space-y-4"
            >
              <FormField
                control={termForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. First Term" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={termForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={selectedSession?.startDate.split('T')[0]}
                          max={selectedSession?.endDate.split('T')[0]}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={termForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={selectedSession?.startDate.split('T')[0]}
                          max={selectedSession?.endDate.split('T')[0]}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTermDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTerm.isPending || updateTerm.isPending}
                >
                  {(createTerm.isPending || updateTerm.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingTerm ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Confirmations ---- */}
      <ConfirmDialog
        open={!!deleteSessionId}
        onOpenChange={(open) => !open && setDeleteSessionId(null)}
        title="Delete Session"
        description="Are you sure you want to delete this academic session? All associated terms will also be removed. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDeleteSession}
        isLoading={deleteSession.isPending}
      />

      <ConfirmDialog
        open={!!deleteTermId}
        onOpenChange={(open) => !open && setDeleteTermId(null)}
        title="Delete Term"
        description="Are you sure you want to delete this term? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDeleteTerm}
        isLoading={deleteTerm.isPending}
      />
    </>
  );
}
