'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  useUploadMigration,
  useValidateMigration,
  useImportMigration,
} from '@/lib/hooks/use-data-migration';
import { uploadFile } from '@/lib/api/files';
import { toast } from 'sonner';
import type { MigrationDataType, MigrationJob } from '@/lib/types/data-migration';

const DATA_TYPES: { value: MigrationDataType; label: string }[] = [
  { value: 'STUDENTS', label: 'Students' },
  { value: 'TEACHERS', label: 'Teachers' },
  { value: 'CLASSES', label: 'Classes' },
  { value: 'SUBJECTS', label: 'Subjects' },
  { value: 'FEES', label: 'Fees' },
];

const TEMPLATE_LINKS: Record<MigrationDataType, string> = {
  STUDENTS: '/templates/students-template.csv',
  TEACHERS: '/templates/teachers-template.csv',
  CLASSES: '/templates/classes-template.csv',
  SUBJECTS: '/templates/subjects-template.csv',
  FEES: '/templates/fees-template.csv',
};

export function MigrationUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dataType, setDataType] = useState<MigrationDataType | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [migrationJob, setMigrationJob] = useState<MigrationJob | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMigration = useUploadMigration();
  const validateMutation = useValidateMigration();
  const importMutation = useImportMigration();

  // ---------------------------------------------------------------------------
  // File selection handlers
  // ---------------------------------------------------------------------------
  const handleFileChange = useCallback(
    (file: File | null) => {
      if (file && !file.name.endsWith('.csv')) {
        return;
      }
      setSelectedFile(file);
      setMigrationJob(null);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0] ?? null;
      handleFileChange(file);
    },
    [handleFileChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setMigrationJob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Upload file, then create migration job, then validate
  // ---------------------------------------------------------------------------
  const handleValidate = useCallback(async () => {
    if (!selectedFile || !dataType) return;

    try {
      // Step 1: Upload the file to get a URL
      setIsUploading(true);
      const fileUrl = await uploadFile(selectedFile, 'migrations');
      setIsUploading(false);

      // Step 2: Create migration job with type + fileUrl
      uploadMigration.mutate(
        { type: dataType, fileUrl },
        {
          onSuccess: (response) => {
            const job = response.data;
            // Step 3: Validate the migration job
            validateMutation.mutate(job.id, {
              onSuccess: (validateResponse) => {
                setMigrationJob(validateResponse.data);
              },
            });
          },
        },
      );
    } catch {
      setIsUploading(false);
      toast.error('Failed to upload file. Please try again.');
    }
  }, [selectedFile, dataType, uploadMigration, validateMutation]);

  // ---------------------------------------------------------------------------
  // Import
  // ---------------------------------------------------------------------------
  const handleImport = useCallback(() => {
    if (!migrationJob) return;

    importMutation.mutate(migrationJob.id, {
      onSuccess: () => {
        setSelectedFile(null);
        setMigrationJob(null);
        setDataType('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  }, [migrationJob, importMutation]);

  const isValidating =
    isUploading || uploadMigration.isPending || validateMutation.isPending;
  const canValidate = !!selectedFile && !!dataType;
  const canImport =
    migrationJob?.status === 'VALIDATED' && migrationJob.failedRecords === 0;

  return (
    <div className="space-y-6">
      {/* Data Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Select Data Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Data Type</Label>
            <Select
              value={dataType}
              onValueChange={(v) => {
                setDataType(v as MigrationDataType);
                setMigrationJob(null);
              }}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {DATA_TYPES.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>
                    {dt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Downloads */}
          <Separator />
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Download CSV Templates
            </p>
            <div className="flex flex-wrap gap-2">
              {DATA_TYPES.map((dt) => (
                <Button
                  key={dt.value}
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={TEMPLATE_LINKS[dt.value]}
                    download
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    {dt.label}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFile ? (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-[#2A9D8F]" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="Remove file" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors',
                isDragOver
                  ? 'border-[#2A9D8F] bg-[#2A9D8F]/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50',
              )}
            >
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drag and drop your CSV file here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or click to browse (CSV files only)
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleValidate}
          disabled={!canValidate || isValidating}
        >
          {isValidating ? 'Validating...' : 'Validate'}
        </Button>
        <Button
          onClick={handleImport}
          disabled={!canImport || importMutation.isPending}
          variant={canImport ? 'default' : 'secondary'}
        >
          {importMutation.isPending ? 'Importing...' : 'Import'}
        </Button>
      </div>

      {/* Validation Results */}
      {migrationJob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {migrationJob.failedRecords === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-[#2A9D8F]" />
                  Validation Passed
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Validation Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Badge variant="outline">
                Total Records: {migrationJob.totalRecords}
              </Badge>
              <Badge
                variant="outline"
                className="border-[#2A9D8F] text-[#2A9D8F]"
              >
                Valid: {migrationJob.totalRecords - migrationJob.failedRecords}
              </Badge>
              {migrationJob.failedRecords > 0 && (
                <Badge variant="destructive">
                  Errors: {migrationJob.failedRecords}
                </Badge>
              )}
            </div>

            {migrationJob.failedRecords === 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Ready to import</AlertTitle>
                <AlertDescription>
                  All {migrationJob.totalRecords} records are valid.
                  Click the &quot;Import&quot; button to proceed.
                </AlertDescription>
              </Alert>
            )}

            {migrationJob.failedRecords > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Errors found</AlertTitle>
                <AlertDescription>
                  {migrationJob.failedRecords} record{migrationJob.failedRecords !== 1 ? 's' : ''} have errors.
                  {migrationJob.errorReportUrl ? (
                    <>
                      {' '}
                      <a
                        href={migrationJob.errorReportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4"
                      >
                        Download error report
                      </a>{' '}
                      for details.
                    </>
                  ) : (
                    ' Fix the errors in your CSV file and re-upload.'
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
