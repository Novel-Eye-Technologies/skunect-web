'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  Upload,
  Trash2,
  FileText,
  Download,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { StudentFormDialog } from '@/components/features/students/student-form-dialog';
import { LinkParentDialog } from '@/components/features/students/link-parent-dialog';
import { StudentAcademicTab } from '@/components/features/students/student-academic-tab';
import { StudentDisciplineTab } from '@/components/features/students/student-discipline-tab';
import { StudentPaymentsTab } from '@/components/features/students/student-payments-tab';
import { StudentSiblingsTab } from '@/components/features/students/student-siblings-tab';
import {
  useStudent,
  useUnlinkParent,
  useUploadDocument,
  useDeleteDocument,
} from '@/lib/hooks/use-students';
import { formatDate } from '@/lib/utils/format-date';
import type { ParentInfo, StudentDocument } from '@/lib/types/student';

export function StudentDetailClient() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  // In a static export, useParams() may return the placeholder value ('_') when
  // nginx serves the pre-rendered page for a different dynamic segment.
  const rawParam = params.studentId as string;
  const studentId =
    !rawParam || rawParam === '_'
      ? pathname.split('/').filter(Boolean)[1] ?? rawParam
      : rawParam;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: student, isLoading } = useStudent(studentId);

  // ---------------------------------------------------------------------------
  // Dialog state
  // ---------------------------------------------------------------------------
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [linkParentOpen, setLinkParentOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<ParentInfo | null>(null);
  const [deleteDocTarget, setDeleteDocTarget] =
    useState<StudentDocument | null>(null);

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------
  const unlinkParent = useUnlinkParent();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadDocument.mutate({ studentId, file });
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function confirmUnlinkParent() {
    if (!unlinkTarget) return;
    unlinkParent.mutate(
      { studentId, parentId: unlinkTarget.id },
      { onSuccess: () => setUnlinkTarget(null) },
    );
  }

  function confirmDeleteDocument() {
    if (!deleteDocTarget) return;
    deleteDocument.mutate(
      { studentId, documentId: deleteDocTarget.id },
      { onSuccess: () => setDeleteDocTarget(null) },
    );
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/students')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
        <p className="text-muted-foreground">Student not found.</p>
      </div>
    );
  }

  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`;

  // ---------------------------------------------------------------------------
  // Info rows helper
  // ---------------------------------------------------------------------------
  function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value ?? '-'}</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        description={`Admission No: ${student.admissionNumber}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/students')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="parents">
            Parents ({student.parents?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="discipline">Welfare</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="siblings">Siblings</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({student.documents?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={student.photo ?? undefined} alt={initials} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>
                  {student.firstName}{' '}
                  {student.otherName ? `${student.otherName} ` : ''}
                  {student.lastName}
                </CardTitle>
                <StatusBadge status={student.status} className="mt-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoRow label="Admission Number" value={student.admissionNumber} />
                <InfoRow
                  label="Date of Birth"
                  value={formatDate(student.dateOfBirth)}
                />
                <InfoRow
                  label="Gender"
                  value={student.gender.charAt(0) + student.gender.slice(1).toLowerCase()}
                />
                <InfoRow label="Class" value={student.className} />
                <InfoRow label="Address" value={student.address} />
                <InfoRow label="State of Origin" value={student.stateOfOrigin} />
                <InfoRow label="LGA" value={student.lga} />
                <InfoRow label="Religion" value={student.religion} />
                <InfoRow label="Blood Group" value={student.bloodGroup} />
                <InfoRow label="Genotype" value={student.genotype} />
                <InfoRow label="Allergies" value={student.allergies} />
                <InfoRow
                  label="Medical Conditions"
                  value={student.medicalConditions}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PARENTS TAB */}
        <TabsContent value="parents">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setLinkParentOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Link Parent
              </Button>
            </div>

            {!student.parents || student.parents.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No parents linked to this student yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(student.parents ?? []).map((parent: ParentInfo) => (
                  <Card key={parent.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold">
                              {parent.firstName} {parent.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {parent.relationship.toLowerCase()}
                            </p>
                          </div>
                          <Separator />
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{parent.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{parent.phone}</span>
                            </div>
                            {parent.occupation && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span>{parent.occupation}</span>
                              </div>
                            )}
                            {parent.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{parent.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setUnlinkTarget(parent)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ACADEMICS TAB */}
        <TabsContent value="academics">
          <StudentAcademicTab studentId={studentId} />
        </TabsContent>

        {/* WELFARE / DISCIPLINE TAB */}
        <TabsContent value="discipline">
          <StudentDisciplineTab studentId={studentId} />
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments">
          <StudentPaymentsTab studentId={studentId} />
        </TabsContent>

        {/* SIBLINGS TAB */}
        <TabsContent value="siblings">
          <StudentSiblingsTab studentId={studentId} />
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents">
          <div className="space-y-4">
            <div className="flex justify-end">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadDocument.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadDocument.isPending ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>

            {!student.documents || student.documents.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No documents uploaded yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(student.documents ?? []).map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="rounded-md bg-muted p-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type} &middot; {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Download document"
                            asChild
                          >
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            aria-label="Delete document"
                            onClick={() => setDeleteDocTarget(doc)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <StudentFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        student={student}
      />

      <LinkParentDialog
        studentId={studentId}
        open={linkParentOpen}
        onOpenChange={setLinkParentOpen}
      />

      <ConfirmDialog
        open={!!unlinkTarget}
        onOpenChange={(open) => {
          if (!open) setUnlinkTarget(null);
        }}
        title="Unlink Parent"
        description={
          unlinkTarget
            ? `Are you sure you want to unlink ${unlinkTarget.firstName} ${unlinkTarget.lastName} from this student?`
            : ''
        }
        confirmLabel="Unlink"
        onConfirm={confirmUnlinkParent}
        isLoading={unlinkParent.isPending}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!deleteDocTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteDocTarget(null);
        }}
        title="Delete Document"
        description={
          deleteDocTarget
            ? `Are you sure you want to delete "${deleteDocTarget.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteDocument}
        isLoading={deleteDocument.isPending}
        variant="destructive"
      />
    </div>
  );
}
