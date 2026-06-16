'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

interface EmptyStatesProps {
  type: 'no-position' | 'loading' | 'no-candidates' | 'no-candidate-selected';
}

export const EmptyStates = memo(function EmptyStates({
  type
}: EmptyStatesProps) {
  const t = useTranslations('recruitment');

  if (type === 'no-position') {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Users className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold'>
            {t('no_positions_selected')}
          </h3>
          <p className='text-muted-foreground mb-4 text-center'>
            {t('no_positions_selected_description')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (type === 'loading') {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>{t('loading')}</span>
        </CardContent>
      </Card>
    );
  }

  if (type === 'no-candidates') {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Users className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold'>
            {t('no_candidates_found_title')}
          </h3>
          <p className='text-muted-foreground text-center'>
            {t('no_candidates_found_description')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (type === 'no-candidate-selected') {
    return (
      <Card className='h-[calc(100vh-350px)]'>
        <CardContent className='flex h-full flex-col items-center justify-center'>
          <Users className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold'>
            {t('no_candidate_selected')}
          </h3>
          <p className='text-muted-foreground text-center'>
            {t('select_candidate_prompt')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
});
