'use client';

import * as React from 'react';
import { Upload, Loader2, FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSize?: number; // bytes, default 5MB
  isUploading?: boolean;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  onUpload,
  accept,
  maxSize = DEFAULT_MAX_SIZE,
  isUploading = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateAndUpload = React.useCallback(
    (file: File) => {
      setError(null);

      // Validate file size
      if (file.size > maxSize) {
        setError(
          `File size exceeds ${formatFileSize(maxSize)}. Selected file is ${formatFileSize(file.size)}.`
        );
        return;
      }

      // Validate file type if accept is specified
      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const fileMimeType = file.type;

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith('.')) {
            return fileExtension === type.toLowerCase();
          }
          if (type.endsWith('/*')) {
            return fileMimeType.startsWith(type.replace('/*', '/'));
          }
          return fileMimeType === type;
        });

        if (!isAccepted) {
          setError(`File type not accepted. Accepted types: ${accept}`);
          return;
        }
      }

      setSelectedFile(file);
      onUpload(file);
    },
    [accept, maxSize, onUpload]
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isUploading) {
        setIsDragging(true);
      }
    },
    [isUploading]
  );

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndUpload(file);
      }
    },
    [isUploading, validateAndUpload]
  );

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        validateAndUpload(file);
      }
      // Reset input so the same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [validateAndUpload]
  );

  const handleClear = React.useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          isUploading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : selectedFile ? (
          <FileIcon className="h-8 w-8 text-muted-foreground" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}

        <div className="mt-3 text-center">
          {isUploading ? (
            <p className="text-sm font-medium text-muted-foreground">
              Uploading...
            </p>
          ) : selectedFile ? (
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium">
                Click or drag file to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {accept && <span>Accepted: {accept}</span>}
                {accept && ' | '}
                Max size: {formatFileSize(maxSize)}
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
