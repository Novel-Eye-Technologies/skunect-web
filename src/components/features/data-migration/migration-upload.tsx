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
  useValidateMigration,
  useImportMigration,
} from '@/lib/hooks/use-data-migration';
import type { MigrationDataType, ValidationResult } from '@/lib/types/data-migration';

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
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
      setValidationResult(null);
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
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Validate
  // ---------------------------------------------------------------------------
  const handleValidate = useCallback(() => {
    if (!selectedFile || !dataType) return;

    validateMutation.mutate(
      { file: selectedFile, type: dataType },
      {
        onSuccess: (response) => {
          setValidationResult(response.data);
        },
      },
    );
  }, [selectedFile, dataType, validateMutation]);

  // ---------------------------------------------------------------------------
  // Import
  // ---------------------------------------------------------------------------
  const handleImport = useCallback(() => {
    if (!selectedFile || !dataType) return;

    importMutation.mutate(
      { file: selectedFile, type: dataType },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setValidationResult(null);
          setDataType('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      },
    );
  }, [selectedFile, dataType, importMutation]);

  const canValidate = !!selectedFile && !!dataType;
  const canImport = validationResult?.valid === true;

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
                setValidationResult(null);
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
              <Button variant="ghost" size="icon" onClick={removeFile}>
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
          disabled={!canValidate || validateMutation.isPending}
        >
          {validateMutation.isPending ? 'Validating...' : 'Validate'}
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
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {validationResult.valid ? (
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
                Total Records: {validationResult.totalRecords}
              </Badge>
              <Badge
                variant="outline"
                className="border-[#2A9D8F] text-[#2A9D8F]"
              >
                Valid: {validationResult.validRecords}
              </Badge>
              {validationResult.errors.length > 0 && (
                <Badge variant="destructive">
                  Errors: {validationResult.errors.length}
                </Badge>
              )}
            </div>

            {validationResult.valid && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Ready to import</AlertTitle>
                <AlertDescription>
                  All {validationResult.validRecords} records are valid.
                  Click the &quot;Import&quot; button to proceed.
                </AlertDescription>
              </Alert>
            )}

            {validationResult.errors.length > 0 && (
              <>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Errors found</AlertTitle>
                  <AlertDescription>
                    Fix the following errors in your CSV file and re-upload.
                  </AlertDescription>
                </Alert>

                <div className="max-h-[300px] overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Row</TableHead>
                        <TableHead className="w-32">Field</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.errors.map((error, index) => (
                        <TableRow key={`error-${index}`}>
                          <TableCell className="font-mono text-xs">
                            {error.row}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {error.field}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {error.message}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
