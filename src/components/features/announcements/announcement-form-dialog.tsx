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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

const announcementFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'PARENTS', 'STUDENTS'], {
    message: 'Please select a target audience',
  }),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT'], {
    message: 'Please select a priority',
  }),
  expiresAt: z.string().optional(),
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
      targetAudience: 'ALL',
      priority: 'NORMAL',
      expiresAt: '',
    },
  });

  useEffect(() => {
    if (announcement && open) {
      form.reset({
        title: announcement.title,
        content: announcement.content,
        targetAudience: announcement.targetAudience,
        priority: announcement.priority,
        expiresAt: announcement.expiresAt
          ? announcement.expiresAt.split('T')[0]
          : '',
      });
      if (announcement.attachmentUrls?.length) {
        setAttachments(
          announcement.attachmentUrls.map((url) => ({
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
        targetAudience: 'ALL',
        priority: 'NORMAL',
        expiresAt: '',
      });
      setAttachments([]);
    }
  }, [announcement, open, form]);

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
        expiresAt: values.expiresAt || undefined,
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="TEACHERS">Teachers</SelectItem>
                        <SelectItem value="PARENTS">Parents</SelectItem>
                        <SelectItem value="STUDENTS">Students</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires At (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
