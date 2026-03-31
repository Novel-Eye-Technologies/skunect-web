'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, X } from 'lucide-react';
import { uploadFile } from '@/lib/api/students';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { StateCombobox } from '@/components/shared/state-combobox';
import {
  useSchoolSettings,
  useUpdateSchoolSettings,
} from '@/lib/hooks/use-school-settings';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const schoolSettingsSchema = z.object({
  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().min(7, 'Phone number must be at least 7 characters'),
  email: z.string().email('Enter a valid email address'),
  motto: z.string().optional().or(z.literal('')),
  website: z
    .string()
    .url('Enter a valid URL')
    .optional()
    .or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  lga: z.string().optional().or(z.literal('')),
  country: z.string().min(2, 'Country is required'),
});

type SchoolSettingsFormValues = z.infer<typeof schoolSettingsSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SchoolSettingsForm() {
  const { data: settings, isLoading } = useSchoolSettings();
  const updateSettings = useUpdateSchoolSettings();

  const form = useForm<SchoolSettingsFormValues>({
    resolver: zodResolver(schoolSettingsSchema),
    defaultValues: {
      schoolName: '',
      address: '',
      phone: '',
      email: '',
      motto: '',
      website: '',
      state: '',
      lga: '',
      country: '',
    },
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        schoolName: settings.schoolName ?? '',
        address: settings.address ?? '',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
        motto: settings.motto ?? '',
        website: settings.website ?? '',
        state: settings.state ?? '',
        lga: settings.lga ?? '',
        country: settings.country ?? '',
      });
      setLogoUrl(settings.logo ?? null);
    }
  }, [settings, form]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const response = await uploadFile(file, 'logos');
      const url = response.data.fileUrl;
      setLogoUrl(url);
      toast.success('Logo uploaded');
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  }

  function onSubmit(values: SchoolSettingsFormValues) {
    updateSettings.mutate({
      schoolName: values.schoolName,
      address: values.address,
      phone: values.phone,
      email: values.email,
      motto: values.motto || undefined,
      website: values.website || undefined,
      state: values.state || undefined,
      lga: values.lga || undefined,
      country: values.country,
      logoUrl: logoUrl || undefined,
    });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
        <CardDescription>
          Update your school&apos;s basic details and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* School Logo */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                {logoUrl ? (
                  <AvatarImage src={logoUrl} alt="School logo" />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {form.watch('schoolName')?.[0] ?? 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-sm font-medium">School Logo</p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingLogo}
                    asChild
                  >
                    <label className="cursor-pointer">
                      {isUploadingLogo ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </Button>
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogoUrl(null)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 200x200px, PNG or JPG, max 2MB
                </p>
              </div>
            </div>

            <Separator />

            {/* School Identity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Greenfield Academy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Knowledge is Power"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="school@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+234 800 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.school.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full school address"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <StateCombobox
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LGA</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Ikeja" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Nigeria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
