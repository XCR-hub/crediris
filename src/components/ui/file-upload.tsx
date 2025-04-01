import React, { useRef, useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  onFileSelect: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number;
  label?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  isComplete?: boolean;
  progress?: number;
  error?: string;
}

export function FileUpload({
  onFileSelect,
  accept = 'application/pdf,image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = 'Sélectionner un fichier',
  helperText,
  className,
  required = false,
  disabled = false,
  isComplete = false,
  progress = 0,
  error
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    await handleFile(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.match(accept.replace(/,/g, '|'))) {
      alert('Type de fichier non supporté');
      return;
    }

    if (file.size > maxSize) {
      alert(`La taille du fichier ne doit pas dépasser ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
    await onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-baseline justify-between">
          <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {helperText && (
            <span className="text-xs text-gray-500">{helperText}</span>
          )}
        </div>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6',
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300',
          error && 'border-red-500 bg-red-50',
          'transition-colors duration-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
        />

        <div className="text-center">
          {!selectedFile ? (
            <>
              <Upload
                className="mx-auto h-12 w-12 text-gray-400"
                aria-hidden="true"
              />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                  >
                    Sélectionner un fichier
                  </Button>
                </label>
                <p className="pl-1">ou glisser-déposer</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                {accept.split(',').join(', ')} jusqu'à {maxSize / 1024 / 1024}MB
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-gray-400" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {progress > 0 && progress < 100 ? (
                  <Progress value={progress} className="w-24" />
                ) : isComplete ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : error ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={disabled || progress > 0}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}