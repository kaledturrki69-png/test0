'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CandidateWithDetails } from '../hooks';
import {
  formatScore,
  getScoreBadgeHoverStyle
} from '../utils/recruiting-utils';
import { memo } from 'react';

interface CandidateListSidebarProps {
  candidates: CandidateWithDetails[];
  selectedCandidate: CandidateWithDetails | null;
  onSelectCandidate: (candidate: CandidateWithDetails) => void;
}

export const CandidateListSidebar = memo(function CandidateListSidebar({
  candidates,
  selectedCandidate,
  onSelectCandidate
}: CandidateListSidebarProps) {
  return (
    <ScrollArea className='h-[calc(100vh-350px)]'>
      <div className='space-y-3 pr-4'>
        {candidates.map((candidate, index) => {
          const isSelected =
            selectedCandidate?.candidate_id === candidate.candidate_id &&
            selectedCandidate?.resume_id === candidate.resume_id;

          return (
            <Card
              key={`${candidate.resume_id}-${candidate.candidate_id}-${index}`}
              className={`group cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? 'border-2 border-blue-500 bg-blue-50/50 shadow-lg'
                  : 'border hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => onSelectCandidate(candidate)}
            >
              <CardContent className='p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='min-w-0 flex-1'>
                    <h3
                      className={`text-sm leading-tight font-semibold break-words ${
                        isSelected ? 'text-blue-700' : 'text-gray-900'
                      }`}
                    >
                      {candidate.first_name} {candidate.last_name}
                    </h3>
                  </div>
                  <Badge
                    className={`flex-shrink-0 font-semibold ${getScoreBadgeHoverStyle(candidate.score)}`}
                  >
                    {formatScore(candidate.score)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <ScrollBar />
    </ScrollArea>
  );
});
