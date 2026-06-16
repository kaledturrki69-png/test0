'use client';

import { useState } from 'react';
import { Document } from '@/types/document';
import { DocumentService } from '@/services/documentService';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { AlertModal } from '@/components/modal/alert-modal';
import dynamic from 'next/dynamic';
import {
  IconDotsVertical,
  IconArchive,
  IconTrash,
  IconEye
} from '@tabler/icons-react';

// Dynamically import FilePreviewModal to avoid SSR issues
const FilePreviewModal = dynamic(
  () =>
    import('@/features/documents/components/file-preview').then((mod) => ({
      default: mod.FilePreviewModal
    })),
  {
    ssr: false
  }
);
import { toast } from 'sonner';

interface CellActionProps {
  data: Document;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const onConfirm = async () => {
    setLoading(true);
    try {
      await DocumentService.deleteDocument(data.id);
      toast.success('Document deleted successfully');
      setOpen(false);
      // Refresh the page to update the document list
      window.location.reload();
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const blob = await DocumentService.downloadDocument(data.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
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

  const canPreview = () => {
    const docType = String(data.doc_type || '').toLowerCase();
    const mimeType = String(data.mime_type || '').toLowerCase();

    return (
      docType === 'pdf' ||
      mimeType === 'application/pdf' ||
      docType === 'word' ||
      docType === 'doc' ||
      docType === 'docx' ||
      mimeType === 'application/msword' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />

      <FilePreviewModal
        document={data}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {canPreview() && (
            <DropdownMenuItem
              onClick={() => setPreviewOpen(true)}
              disabled={loading}
            >
              <IconEye className='mr-2 h-4 w-4' /> View
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleDownload} disabled={loading}>
            <IconArchive className='mr-2 h-4 w-4' /> Download
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpen(true)} disabled={loading}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
