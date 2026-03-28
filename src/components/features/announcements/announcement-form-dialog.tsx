'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Loader2, FileIcon, X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from '@/lib/hooks/use-announcements';
import { uploadFile } from '@/lib/api/files';
import type { Announcement } from '@/lib/types/announcements';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useClasses } from '@/lib/queries/useClasses';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

const announcementFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'PARENTS', 'CLASS_SPECIFIC'], {
    message: 'Please select a target audience',
  }),
  targetClassId: z.string().optional(),
}).superRefine((values, ctx) => {
  const requiresClass =
    values.targetAudience === 'CLASS_SPECIFIC' || values.targetAudience === 'PARENTS';

  if (requiresClass && !values.targetClassId?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['targetClassId'],
      message: 'Please select a target class',
    });
  }
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

interface AttachmentItem {
  id: string;
  file?: File;
  url?: string;
  name: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface AnnouncementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement;
}

function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split('/').pop() || url);
  } catch {
    return url.split('/').pop() || url;
  }
}

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
}: AnnouncementFormDialogProps) {
  const isEdit = !!announcement;
  const currentRole = useAuthStore((s) => s.currentRole);
  const isTeacher = currentRole === 'TEACHER';
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      content: '',
      targetAudience: isTeacher ? 'PARENTS' : 'ALL',
      targetClassId: '',
    },
  });

  const { data: classesResponse } = useClasses();

  const targetAudience = form.watch('targetAudience');

  useEffect(() => {
    if (announcement && open) {
      form.reset({
        title: announcement.title,
        content: announcement.content,
        targetAudience: announcement.targetAudience as 'ALL' | 'TEACHERS' | 'PARENTS' | 'CLASS_SPECIFIC',
      });
      if (announcement.attachmentUrls?.length) {
        setAttachments(
          announcement.attachmentUrls
            .filter((u): u is string => u !== null)
            .map((url) => ({
              id: crypto.randomUUID(),
              url,
              name: getFileNameFromUrl(url),
              status: 'done' as const,
            })),
        );
      } else {
        setAttachments([]);
      }
    } else if (!open) {
      form.reset({
        title: '',
        content: '',
        targetAudience: isTeacher ? 'PARENTS' : 'ALL',
      });
      setAttachments([]);
    }
  }, [announcement, open, form, isTeacher]);

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const remaining = MAX_FILES - attachments.length;
      const filesToAdd = Array.from(files).slice(0, remaining);

      const newItems: AttachmentItem[] = filesToAdd
        .filter((file) => file.size <= MAX_FILE_SIZE)
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          status: 'pending' as const,
        }));

      setAttachments((prev) => [...prev, ...newItems]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [attachments.length],
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  async function uploadPendingFiles(): Promise<string[]> {
    const updated = [...attachments];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (item.status === 'done' && item.url) continue;
      if (!item.file) continue;

      updated[i] = { ...item, status: 'uploading' };
      setAttachments([...updated]);

      try {
        const url = await uploadFile(item.file, 'announcements');
        updated[i] = { ...updated[i], status: 'done', url };
        setAttachments([...updated]);
      } catch {
        updated[i] = { ...updated[i], status: 'error', error: 'Upload failed' };
        setAttachments([...updated]);
        throw new Error('One or more files failed to upload');
      }
    }

    return updated.filter((a) => a.url).map((a) => a.url!);
  }

  async function onSubmit(values: AnnouncementFormValues) {
    try {
      setIsUploadingFiles(true);
      const attachmentUrls = await uploadPendingFiles();
      setIsUploadingFiles(false);

      const payload = {
        ...values,
        attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
      };

      if (isEdit) {
        updateAnnouncement.mutate(
          { announcementId: announcement.id, data: payload },
          {
            onSuccess: () => {
              form.reset();
              setAttachments([]);
              onOpenChange(false);
            },
          },
        );
      } else {
        createAnnouncement.mutate(payload, {
          onSuccess: () => {
            form.reset();
            setAttachments([]);
            onOpenChange(false);
          },
        });
      }
    } catch {
      setIsUploadingFiles(false);
    }
  }

  const isPending =
    createAnnouncement.isPending ||
    updateAnnouncement.isPending ||
    isUploadingFiles;

  const canAddMoreFiles = attachments.length < MAX_FILES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Announcement' : 'Create Announcement'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the announcement details below.'
              : 'Fill in the details to create a new announcement.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. School Closure Notice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);

                        if (value !== 'CLASS_SPECIFIC' && value !== 'PARENTS') {
                          form.setValue('targetClassId', '');
                          form.clearErrors('targetClassId');
                          return;
                        }

                        form.trigger('targetClassId');
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!isTeacher && <SelectItem value="ALL">All</SelectItem>}
                        <SelectItem value="TEACHERS">Teachers</SelectItem>
                        <SelectItem value="PARENTS">Parents</SelectItem>
                        <SelectItem value="CLASS_SPECIFIC">Class Specific</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(targetAudience === 'CLASS_SPECIFIC' || targetAudience === 'PARENTS') && (
                <FormField
                  control={form.control}
                  name="targetClassId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Class</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classesResponse?.map((classItem: { id: string; name: string }) => (
                            <SelectItem key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.targetClassId?.message && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.targetClassId.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              )}
            </div>


            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write the announcement content..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachments */}
            <div className="space-y-2">
              <FormLabel>Attachments (Optional)</FormLabel>
              {attachments.length > 0 && (
                <ul className="space-y-1.5">
                  {attachments.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      {item.status === 'uploading' ? (
                        <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-muted-foreground" />
                      ) : (
                        <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      )}
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.status === 'error' && (
                        <span className="text-xs text-destructive">{item.error}</span>
                      )}
                      {item.status === 'uploading' ? (
                        <span className="text-xs text-muted-foreground">Uploading...</span>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeAttachment(item.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {canAddMoreFiles && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Add Files
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Max {MAX_FILES} files, 10 MB each
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isUploadingFiles
                  ? 'Uploading files...'
                  : isPending
                    ? 'Saving...'
                    : isEdit
                      ? 'Save Changes'
                      : 'Create Announcement'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
