'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconPlus, IconBook } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface QuizEmptyStateProps {
  hasFilters: boolean;
  onCreateClick: () => void;
}

export function QuizEmptyState({
  hasFilters,
  onCreateClick
}: QuizEmptyStateProps) {
  const t = useTranslations('quiz_components');

  return (
    <Card>
      <CardContent className='flex flex-col items-center justify-center py-12'>
        <IconBook className='text-muted-foreground mb-4 h-12 w-12' />
        <h3 className='mb-2 text-lg font-semibold'>{t('no_templates')}</h3>
        <p className='text-muted-foreground mb-4 text-center'>
          {hasFilters ? t('no_quizzes_match') : t('create_first_template')}
        </p>
        {!hasFilters && (
          <Button onClick={onCreateClick}>
            <IconPlus className='mr-2 h-4 w-4' />
            {t('add_quiz_template')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
