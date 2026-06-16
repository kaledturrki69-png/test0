'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  IconDownload,
  IconExternalLink,
  IconX,
  IconFileText
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface WordViewerProps {
  documentId: number;
  filename: string;
  onClose: () => void;
}

export function WordViewer({ documentId, filename, onClose }: WordViewerProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    const url = `/api/documents/${documentId}/download`;
    window.open(url, '_blank');
  };

  return (
    <div className='flex h-full w-full flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between border-b bg-gray-50 p-4'>
        <div className='flex items-center space-x-2'>
          <IconFileText className='h-5 w-5 text-blue-600' />
          <h3 className='max-w-md truncate text-lg font-semibold'>
            {filename}
          </h3>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleOpenInNewTab}
            className='flex items-center space-x-1'
          >
            <IconExternalLink className='h-4 w-4' />
            <span>Open in New Tab</span>
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleDownload}
            disabled={loading}
            className='flex items-center space-x-1'
          >
            <IconDownload className='h-4 w-4' />
            <span>{loading ? 'Downloading...' : 'Download'}</span>
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            className='flex items-center space-x-1'
          >
            <IconX className='h-4 w-4' />
            <span>Close</span>
          </Button>
        </div>
      </div>

      {/* Word Document Content */}
      <div className='flex-1 bg-white p-8'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-8 text-center'>
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-lg bg-blue-100'>
              <IconFileText className='h-10 w-10 text-blue-600' />
            </div>
            <h2 className='mb-3 text-2xl font-semibold text-gray-900'>
              Word Document Preview
            </h2>
            <p className='mx-auto mb-6 max-w-2xl text-gray-600'>
              Word documents cannot be previewed inline in the browser. To view
              this document, please download it or open it in a new tab using
              Microsoft Word, Google Docs, or another compatible application.
            </p>
          </div>

          <div className='rounded-lg bg-gray-50 p-8 text-center'>
            <h3 className='mb-4 text-lg font-medium text-gray-900'>
              How to view this document:
            </h3>
            <div className='mb-8 grid gap-6 md:grid-cols-2'>
              <div className='text-left'>
                <h4 className='mb-2 font-medium text-gray-900'>
                  Option 1: Download
                </h4>
                <p className='mb-3 text-sm text-gray-600'>
                  Download the document to your computer and open it with
                  Microsoft Word or another compatible application.
                </p>
                <Button
                  onClick={handleDownload}
                  disabled={loading}
                  className='w-full'
                >
                  <IconDownload className='mr-2 h-4 w-4' />
                  {loading ? 'Downloading...' : 'Download Document'}
                </Button>
              </div>

              <div className='text-left'>
                <h4 className='mb-2 font-medium text-gray-900'>
                  Option 2: Open in New Tab
                </h4>
                <p className='mb-3 text-sm text-gray-600'>
                  Open the document in a new browser tab. Your browser may
                  prompt you to download or open with an external application.
                </p>
                <Button
                  onClick={handleOpenInNewTab}
                  variant='outline'
                  className='w-full'
                >
                  <IconExternalLink className='mr-2 h-4 w-4' />
                  Open in New Tab
                </Button>
              </div>
            </div>

            <div className='border-t pt-6'>
              <p className='text-sm text-gray-500'>
                Supported formats: .doc, .docx, .rtf
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
