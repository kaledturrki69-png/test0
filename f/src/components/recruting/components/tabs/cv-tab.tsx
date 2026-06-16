'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import CVTemplate from '@/components/cv-template';
import { formatCandidateForCV } from '@/lib/format-cv-data';
import { CandidateWithDetails } from '../../hooks';
import { getPhotoUrl } from '../../utils/recruiting-utils';
import { memo } from 'react';

interface CVTabProps {
  selectedCandidate: CandidateWithDetails;
}

export const CVTab = memo(function CVTab({ selectedCandidate }: CVTabProps) {
  return (
    <Card className='h-full'>
      <ScrollArea className='h-full'>
        <CardContent className='p-6'>
          <CVTemplate
            candidate={formatCandidateForCV({
              id: selectedCandidate.candidate_id,
              first_name: selectedCandidate.first_name,
              last_name: selectedCandidate.last_name,
              email1: selectedCandidate.email1,
              phone1: selectedCandidate.phone1,
              location: selectedCandidate.location,
              resume: selectedCandidate.resume,
              avatar: getPhotoUrl(selectedCandidate.resume?.candidate?.photo)
            })}
          />
        </CardContent>
        <ScrollBar />
      </ScrollArea>
    </Card>
  );
});
