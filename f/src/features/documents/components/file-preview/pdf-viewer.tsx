'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import {
  IconChevronLeft,
  IconChevronRight,
  IconZoomIn,
  IconZoomOut
} from '@tabler/icons-react';
/* import { toast } from 'sonner'; */

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFViewerProps {
  documentId: number;
  filename: string;
  fileUrl: string; //
  onClose: () => void;
}

export function PDFViewer({ fileUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  /* const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Document downloaded successfully');
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank');
  };
 */
  return (
    <div className='flex h-full w-full flex-col'>
      {/* Header */}
      {/*    <div className='flex items-center justify-between border-b bg-gray-50 p-4'>
        <div className='flex items-center space-x-4'>
          <h3 className='truncate text-lg font-semibold'>{filename}</h3>
          {numPages > 0 && (
            <span className='text-muted-foreground text-sm'>
              Page {pageNumber} of {numPages}
            </span>
          )}
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm' onClick={handleOpenInNewTab}>
            <IconExternalLink className='h-4 w-4' />
            <span>Open</span>
          </Button>
          <Button variant='outline' size='sm' onClick={handleDownload}>
            <IconDownload className='h-4 w-4' />
            <span>Download</span>
          </Button>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <IconX className='h-4 w-4' />
            <span>Close</span>
          </Button>
        </div>
      </div> */}

      {/* Controls */}
      {numPages > 0 && (
        <div className='flex items-center justify-between border-t bg-gray-50 p-3'>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
            >
              <IconChevronLeft className='h-4 w-4' />
              Prev
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
            >
              Next
              <IconChevronRight className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
            >
              <IconZoomOut className='h-4 w-4' />
            </Button>
            <span className='text-muted-foreground min-w-[60px] text-center text-sm'>
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setScale((s) => Math.min(3.0, s + 0.2))}
            >
              <IconZoomIn className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      {/* PDF Viewer */}

      <div className='flex-1 overflow-auto bg-gray-100 p-4'>
        <div className='flex justify-center'>
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className='border border-gray-300 shadow-lg'
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
