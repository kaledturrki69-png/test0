'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { CandidateWithDetails } from '../../hooks';
import { memo } from 'react';

const PDFViewer = dynamic(
  () =>
    import('@/features/documents/components/file-preview/pdf-viewer').then(
      (mod) => ({ default: mod.PDFViewer })
    ),
  { ssr: false }
);

interface OriginalCVTabProps {
  selectedCandidate: CandidateWithDetails;
  pdfUrl: string | null;
  loadingPdf: boolean;
  onClosePdf: () => void;
}

export const OriginalCVTab = memo(function OriginalCVTab({
  selectedCandidate,
  pdfUrl,
  loadingPdf,
  onClosePdf
}: OriginalCVTabProps) {
  const t = useTranslations('recruitment');

  return (
    <Card className='h-full'>
      <CardContent className='flex h-full items-center justify-center'>
        {loadingPdf ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span>{t('loading_pdf')}</span>
          </div>
        ) : pdfUrl ? (
          <div className='h-full w-full'>
            <PDFViewer
              documentId={selectedCandidate.resume?.document || 0}
              filename={`${selectedCandidate.first_name}_${selectedCandidate.last_name}_CV.pdf`}
              fileUrl={pdfUrl}
              onClose={onClosePdf}
            />
          </div>
        ) : (
          <div className='text-center'>
            <FileText className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <p className='text-muted-foreground'>{t('no_original_cv')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
