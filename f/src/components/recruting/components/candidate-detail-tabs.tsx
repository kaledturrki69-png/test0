'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, Award, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CandidateWithDetails } from '../hooks';
import { formatScore } from '../utils/recruiting-utils';
import { CVTab } from './tabs/cv-tab';
import { OriginalCVTab } from './tabs/original-cv-tab';
import { ScoreTab } from './tabs/score-tab';
import { OperationTab } from './tabs/operation-tab';
import { memo } from 'react';

interface CandidateDetailTabsProps {
  selectedCandidate: CandidateWithDetails;
  pdfUrl: string | null;
  loadingPdf: boolean;
  onClosePdf: () => void;
}

export const CandidateDetailTabs = memo(function CandidateDetailTabs({
  selectedCandidate,
  pdfUrl,
  loadingPdf,
  onClosePdf
}: CandidateDetailTabsProps) {
  const t = useTranslations('recruitment');

  return (
    <Tabs defaultValue='cv' className='h-full'>
      <TabsList className='grid w-full grid-cols-4'>
        <TabsTrigger value='cv'>
          <FileText className='mr-2 h-4 w-4' />
          {t('tab_cv')}
        </TabsTrigger>
        <TabsTrigger value='original'>
          <Eye className='mr-2 h-4 w-4' />
          {t('tab_original_cv')}
        </TabsTrigger>
        <TabsTrigger value='score'>
          <Award className='mr-2 h-4 w-4' />
          {t('tab_assessment')}{' '}
          <span className='ml-1 font-semibold text-red-600'>
            {formatScore(selectedCandidate.score)}%
          </span>
        </TabsTrigger>
        <TabsTrigger value='operation'>
          <Calendar className='mr-2 h-4 w-4' />
          {t('tab_operation')}
        </TabsTrigger>
      </TabsList>

      {/* CV Template Tab */}
      <TabsContent value='cv' className='h-[calc(100vh-420px)]'>
        <CVTab selectedCandidate={selectedCandidate} />
      </TabsContent>

      {/* Original CV Tab */}
      <TabsContent value='original' className='h-[calc(100vh-420px)]'>
        <OriginalCVTab
          selectedCandidate={selectedCandidate}
          pdfUrl={pdfUrl}
          loadingPdf={loadingPdf}
          onClosePdf={onClosePdf}
        />
      </TabsContent>

      {/* Score Tab */}
      <TabsContent value='score' className='h-[calc(100vh-420px)]'>
        <ScoreTab selectedCandidate={selectedCandidate} />
      </TabsContent>

      {/* Operation Tab */}
      <TabsContent value='operation' className='h-[calc(100vh-420px)]'>
        <OperationTab selectedCandidate={selectedCandidate} />
      </TabsContent>
    </Tabs>
  );
});
