'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { Document } from '@/types/document';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Dynamically import PDF and Word viewers
const PDFViewer = dynamic(
  () => import('./pdf-viewer').then((mod) => ({ default: mod.PDFViewer })),
  { ssr: false }
);

const WordViewer = dynamic(
  () => import('./word-viewer').then((mod) => ({ default: mod.WordViewer })),
  { ssr: false }
);

interface FilePreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreviewModal({
  document,
  isOpen,
  onClose
}: FilePreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pdfUrlRef = useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    pdfUrlRef.current = pdfUrl;
  }, [pdfUrl]);

  useEffect(() => {
    if (!document || !isOpen) return;

    const fetchPdf = async () => {
      if (String(document.mime_type).includes('pdf')) {
        setLoading(true);

        try {
          const res = await fetch(`/api/documents/${document.id}/download`);
          if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);

          if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);

          setPdfUrl(url);
        } catch (err) {
          toast.error('Failed to load PDF preview');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPdf();

    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        setPdfUrl(null);
      }
    };
  }, [document, isOpen]);

  if (!document) return null;

  const fileType = (() => {
    const t = String(document.doc_type || '').toLowerCase();
    const m = String(document.mime_type || '').toLowerCase();
    if (t === 'pdf' || m.includes('pdf')) return 'pdf';
    if (t.includes('word') || m.includes('word')) return 'word';
    return 'unknown';
  })();

  const renderViewer = () => {
    if (loading) {
      return (
        <div className='flex h-96 items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900' />
        </div>
      );
    }

    switch (fileType) {
      case 'pdf':
        return pdfUrl ? (
          <PDFViewer
            documentId={document.id}
            filename={document.filename}
            fileUrl={pdfUrl}
            onClose={onClose}
          />
        ) : (
          <div className='flex h-96 items-center justify-center text-gray-600'>
            PDF not available
          </div>
        );
      case 'word':
        return (
          <WordViewer
            documentId={document.id}
            filename={document.filename}
            onClose={onClose}
          />
        );
      default:
        return (
          <div className='flex h-96 items-center justify-center'>
            <div className='text-center'>
              <p className='mb-4 text-gray-700'>Unsupported file type</p>
              <button
                onClick={onClose}
                className='rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200'
              >
                Close
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='h-[95vh] max-w-7xl p-0'>
        <DialogHeader className='sr-only'>
          <DialogTitle>File Preview - {document.filename}</DialogTitle>
          <DialogDescription>Previewing {document.filename}</DialogDescription>
        </DialogHeader>
        <div className='h-full w-full'>{renderViewer()}</div>
      </DialogContent>
    </Dialog>
  );
}
