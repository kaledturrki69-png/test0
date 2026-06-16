'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Calendar, Clock, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CandidateWithDetails } from '../../hooks';
import { memo } from 'react';

interface OperationTabProps {
  selectedCandidate: CandidateWithDetails;
}

export const OperationTab = memo(function OperationTab({
  selectedCandidate
}: OperationTabProps) {
  const t = useTranslations('recruitment');

  return (
    <Card className='h-full'>
      <ScrollArea className='h-full'>
        <CardContent className='p-6'>
          <div className='space-y-6'>
            {/* Header */}
            <div>
              <h2 className='text-2xl font-bold'>{t('next_appointment')}</h2>
              <p className='text-muted-foreground mt-1'>
                {t('operation_subtitle')}
              </p>
            </div>

            {/* Appointment and Candidate Info Grid */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Appointment Details Card */}
              <Card className='border-2 border-blue-200 bg-blue-50/30'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Calendar className='h-5 w-5 text-blue-600' />
                    {t('scheduled_interview')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Date */}
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                      <Calendar className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <p className='text-muted-foreground text-sm'>
                        {t('date')}
                      </p>
                      <p className='font-semibold'>
                        {t('sample_interview_date')}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                      <Clock className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <p className='text-muted-foreground text-sm'>
                        {t('time')}
                      </p>
                      <p className='font-semibold'>
                        {t('sample_interview_time')}
                      </p>
                    </div>
                  </div>

                  {/* Location/Type */}
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                      <Users className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <p className='text-muted-foreground text-sm'>
                        {t('type')}
                      </p>
                      <p className='font-semibold'>
                        {t('video_interview_meeting')}
                      </p>
                    </div>
                  </div>

                  {/* Interviewer */}
                  <div className='flex items-center gap-3'>
                    <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                      <Users className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <p className='text-muted-foreground text-sm'>
                        {t('interviewer')}
                      </p>
                      <p className='font-semibold'>{t('sample_interviewer')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Candidate Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    {t('candidate_info')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>{t('name')}</span>
                    <span className='font-medium'>
                      {selectedCandidate.first_name}{' '}
                      {selectedCandidate.last_name}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>{t('email')}</span>
                    <span className='font-medium'>
                      {selectedCandidate.email1 || t('not_available')}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>{t('phone')}</span>
                    <span className='font-medium'>
                      {selectedCandidate.phone1 || t('not_available')}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>
                      {t('position_name')}
                    </span>
                    <span className='font-medium'>
                      {selectedCandidate.resume?.json_data?.title ||
                        t('not_available')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Decision Section */}
            <Card className='border-2'>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {t('interview_decision')}
                </CardTitle>
                <p className='text-muted-foreground text-sm'>
                  {t('interview_decision_subtitle')}
                </p>
              </CardHeader>
              <CardContent>
                <div className='flex gap-4'>
                  <Button
                    className='flex-1 bg-green-600 hover:bg-green-700'
                    size='lg'
                  >
                    <CheckCircle2 className='mr-2 h-5 w-5' />
                    {t('accept_candidate')}
                  </Button>
                  <Button variant='destructive' className='flex-1' size='lg'>
                    <XCircle className='mr-2 h-5 w-5' />
                    {t('refuse_candidate')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <ScrollBar />
      </ScrollArea>
    </Card>
  );
});
