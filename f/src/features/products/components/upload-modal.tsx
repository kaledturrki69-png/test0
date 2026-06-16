'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface UploadModalProps {
  children: React.ReactNode;
  currentFile?: {
    name: string;
    size: string;
  };
  mode?: 'upload' | 'update';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UploadModal({
  children,
  currentFile,
  mode = 'upload',
  isOpen: externalIsOpen,
  onOpenChange
}: UploadModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Initialize with current file if in update mode
  React.useEffect(() => {
    if (mode === 'update' && currentFile && isOpen) {
      // Create a mock File object from current file data
      const mockFile = new File([], currentFile.name);
      setUploadedFiles([mockFile]);
    }
  }, [mode, currentFile, isOpen]);

  // Reset files when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setUploadedFiles([]);
    }
  }, [isOpen]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    // Filter only PDF files
    const pdfFiles = files.filter((file) => file.type === 'application/pdf');
    setUploadedFiles((prev) => [...prev, ...pdfFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Filter only PDF files
      const pdfFiles = files.filter((file) => file.type === 'application/pdf');
      setUploadedFiles((prev) => [...prev, ...pdfFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    setUploadedFiles([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'update' ? 'Update CV' : 'Upload CV'}
          </DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div
            className={cn(
              'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className='flex flex-col items-center justify-center space-y-2'>
              <IconPlus className='h-8 w-8 text-gray-400' />
              <p className='text-sm text-gray-600'>
                Drag and drop PDF files here, or click to select PDF files
              </p>
              <input
                type='file'
                multiple
                accept='.pdf,application/pdf'
                className='hidden'
                id='file-upload'
                onChange={handleFileChange}
              />
              <label
                htmlFor='file-upload'
                className='text-primary cursor-pointer text-sm font-medium hover:underline'
                onClick={(e) => e.stopPropagation()}
              >
                Browse PDF files
              </label>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>Selected Files:</h4>
              <ul className='space-y-1'>
                {uploadedFiles.map((file, index) => (
                  <li
                    key={index}
                    className='flex items-center justify-between text-sm'
                  >
                    <span>{file.name}</span>
                    <button
                      type='button'
                      className='text-red-500 hover:text-red-700'
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className='flex justify-end space-x-2 pt-2'>
            <Button variant='outline' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadedFiles.length === 0}
            >
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
