'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Award } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CandidateWithDetails } from '../../hooks';
import { formatScore, getScoreColor } from '../../utils/recruiting-utils';
import { memo } from 'react';

interface ScoreTabProps {
  selectedCandidate: CandidateWithDetails;
}

export const ScoreTab = memo(function ScoreTab({
  selectedCandidate
}: ScoreTabProps) {
  const t = useTranslations('recruitment');

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Award className='h-5 w-5' />
          {t('skills_and_technologies')}
        </CardTitle>
        <p className='text-muted-foreground text-sm'>
          {t('match_score_label')}{' '}
          <span
            className={`font-bold ${getScoreColor(selectedCandidate.score)}`}
          >
            {formatScore(selectedCandidate.score)}%
          </span>
        </p>
      </CardHeader>
      <ScrollArea className='h-[calc(100%-120px)]'>
        <CardContent>
          <div className='space-y-4'>
            {/* Technologies/Hard Skills */}
            <div>
              <h3 className='mb-3 font-semibold'>{t('technologies')}</h3>
              <div className='flex flex-wrap gap-2'>
                {selectedCandidate.resume?.json_data?.experience
                  ?.flatMap(
                    (exp) =>
                      exp.positions?.flatMap(
                        (pos) => pos.skillsUsed?.technologies || []
                      ) || []
                  )
                  .filter(
                    (skill, index, self) =>
                      self.findIndex((s) => s.name === skill.name) === index
                  )
                  .map((skill, index) => (
                    <Badge
                      key={index}
                      variant='secondary'
                      className='px-3 py-1'
                    >
                      {skill.name}
                      {skill.status && ` (${skill.status})`}
                    </Badge>
                  )) || (
                  <p className='text-muted-foreground text-sm'>
                    {t('no_technologies')}
                  </p>
                )}
              </div>
            </div>

            {/* Languages */}
            {selectedCandidate.resume?.json_data?.languages &&
              selectedCandidate.resume.json_data.languages.length > 0 && (
                <div>
                  <h3 className='mb-3 font-semibold'>{t('languages')}</h3>
                  <div className='flex flex-wrap gap-2'>
                    {selectedCandidate.resume.json_data.languages.map(
                      (lang, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='px-3 py-1'
                        >
                          {lang.language}
                          {lang.level && ` - ${lang.level}`}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Soft Skills - Placeholder */}
            <div>
              <h3 className='mb-3 font-semibold'>{t('soft_skills')}</h3>
              <p className='text-muted-foreground text-sm'>
                {t('soft_skills_analysis')}
              </p>
            </div>
          </div>
        </CardContent>
        <ScrollBar />
      </ScrollArea>
    </Card>
  );
});
