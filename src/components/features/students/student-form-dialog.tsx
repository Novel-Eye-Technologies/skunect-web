'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Camera, Plus, Trash2, Upload, User } from 'lucide-react';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StateCombobox } from '@/components/shared/state-combobox';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getClasses } from '@/lib/api/school-settings';
import { uploadFile } from '@/lib/api/students';
import { useCreateStudent, useUpdateStudent } from '@/lib/hooks/use-students';
import { toast } from 'sonner';
import type { StudentDetail } from '@/lib/types/student';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const guardianSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  isEmergencyContact: z.boolean(),
});

const studentFormSchema = z.object({
  admissionNumber: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  otherName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE'], {
    message: 'Please select a gender',
  }),
  classId: z.string().min(1, 'Please select a class'),
  photoUrl: z.string().optional(),
  address: z.string().optional(),
  stateOfOrigin: z.string().optional(),
  lga: z.string().optional(),
  religion: z.string().optional(),
  bloodGroup: z.string().optional(),
  genotype: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  guardians: z.array(guardianSchema).optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: StudentDetail;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
}: StudentFormDialogProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const isEdit = !!student;

  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const classes = classesResponse ?? [];

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      admissionNumber: '',
      firstName: '',
      lastName: '',
      otherName: '',
      dateOfBirth: '',
      gender: undefined,
      classId: '',
      photoUrl: '',
      address: '',
      stateOfOrigin: '',
      lga: '',
      religion: '',
      bloodGroup: '',
      genotype: '',
      allergies: '',
      medicalConditions: '',
      guardians: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'guardians',
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (student && open) {
      form.reset({
        admissionNumber: student.admissionNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        otherName: student.otherName ?? '',
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        classId: student.classId,
        photoUrl: student.photo ?? '',
        address: student.address ?? '',
        stateOfOrigin: student.stateOfOrigin ?? '',
        lga: student.lga ?? '',
        religion: student.religion ?? '',
        bloodGroup: student.bloodGroup ?? '',
        genotype: student.genotype ?? '',
        allergies: student.allergies ?? '',
        medicalConditions: student.medicalConditions ?? '',
        guardians: [],
      });
      setPhotoPreview(student.photo ?? null);
    } else if (!open) {
      form.reset();
      setPhotoPreview(null);
    }
  }, [student, open, form]);

  const handlePhotoSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      // Show local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);

      // Upload to server
      setIsUploadingPhoto(true);
      try {
        const response = await uploadFile(file, 'student-photos');
        form.setValue('photoUrl', response.data.fileUrl);
        toast.success('Photo uploaded');
      } catch {
        toast.error('Failed to upload photo');
        setPhotoPreview(null);
        form.setValue('photoUrl', '');
      } finally {
        setIsUploadingPhoto(false);
      }
    },
    [form],
  );

  function onSubmit(values: StudentFormValues) {
    if (isEdit) {
      // Map to UpdateStudentRequest fields (backend uses middleName, not otherName;
      // does not accept classId, admissionNumber, or guardians on update)
      const updateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.otherName || undefined,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        photoUrl: values.photoUrl || undefined,
        address: values.address || undefined,
        stateOfOrigin: values.stateOfOrigin || undefined,
        lga: values.lga || undefined,
        religion: values.religion || undefined,
        bloodGroup: values.bloodGroup || undefined,
        genotype: values.genotype || undefined,
        allergies: values.allergies || undefined,
        medicalConditions: values.medicalConditions || undefined,
      };
      updateStudent.mutate(
        { studentId: student.id, data: updateData },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    } else {
      // Clean up empty guardians array
      const createData = {
        ...values,
        guardians: values.guardians?.length ? values.guardians : undefined,
      };
      createStudent.mutate(createData, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  }

  const isPending = createStudent.isPending || updateStudent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Student' : 'Enroll Student'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the student information below.'
              : 'Fill in the details to enroll a new student.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Passport Photo ─────────────────────────────────── */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-dashed border-muted-foreground/25">
                  <AvatarImage src={photoPreview ?? undefined} />
                  <AvatarFallback className="bg-muted">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Passport Photo</p>
                <p className="text-xs text-muted-foreground">
                  {isUploadingPhoto
                    ? 'Uploading...'
                    : 'Click the camera icon to upload (Max 5MB)'}
                </p>
              </div>
            </div>

            {/* ── Basic Info ─────────────────────────────────────── */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Basic Information</h4>
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="admissionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Leave blank to auto-generate" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Auto-generated if left blank
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                              {cls.section ? ` (${cls.section})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="otherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Middle name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="religion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Religion (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Christianity" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 5 - Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Home address"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Row 6 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stateOfOrigin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State of Origin (Optional)</FormLabel>
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
                      <FormLabel>LGA (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Local government area" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ── Medical Info ────────────────────────────────────── */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Medical Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. O+" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="genotype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genotype (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. AA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Known allergies" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medicalConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Known conditions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ── Guardian Info (Create only) ─────────────────────── */}
            {!isEdit && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Guardian / Parent Information
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Add at least one guardian for the student
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        relationship: '',
                        isEmergencyContact: false,
                      })
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Guardian
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Guardian {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        aria-label={`Remove guardian ${index + 1}`}
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`guardians.${index}.firstName`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" className="h-8" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`guardians.${index}.lastName`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" className="h-8" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`guardians.${index}.email`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="guardian@email.com"
                                className="h-8"
                                {...f}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`guardians.${index}.phone`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="08012345678" className="h-8" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`guardians.${index}.relationship`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Relationship</FormLabel>
                            <Select onValueChange={f.onChange} value={f.value}>
                              <FormControl>
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="FATHER">Father</SelectItem>
                                <SelectItem value="MOTHER">Mother</SelectItem>
                                <SelectItem value="GUARDIAN">Guardian</SelectItem>
                                <SelectItem value="UNCLE">Uncle</SelectItem>
                                <SelectItem value="AUNT">Aunt</SelectItem>
                                <SelectItem value="SIBLING">Sibling</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`guardians.${index}.isEmergencyContact`}
                        render={({ field: f }) => (
                          <FormItem className="flex items-end gap-2 pb-1">
                            <FormControl>
                              <Checkbox
                                checked={f.value}
                                onCheckedChange={f.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs font-normal">
                              Emergency Contact
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Actions ────────────────────────────────────────── */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isUploadingPhoto}>
                {isPending
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Enroll Student'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
