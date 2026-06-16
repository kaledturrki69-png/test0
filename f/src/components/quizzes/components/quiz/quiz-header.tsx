'use client';

import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { Grid3X3, List } from 'lucide-react';
import { QuizTemplate } from '@/types/quiz';
import { useTranslations } from 'next-intl';

interface QuizHeaderProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  onAddClick: () => void;
  loading: boolean;
  templates: QuizTemplate[];
}

export function QuizHeader({
  viewMode,
  setViewMode,
  onAddClick,
  loading
}: QuizHeaderProps) {
  const t = useTranslations('quiz_components');

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <h2 className='text-3xl font-bold tracking-tight'>
            {t('quizzes_title')}
          </h2>
          <Button
            onClick={onAddClick}
            className='flex items-center gap-2'
            disabled={loading}
          >
            <IconPlus className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex items-center space-x-2'>
          <span className='text-muted-foreground text-sm'>
            {t('view_label')}
          </span>
          <div className='flex rounded-lg border border-gray-200 p-1'>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='h-8 w-8 p-0'
            >
              <Grid3X3 className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('table')}
              className='h-8 w-8 p-0'
            >
              <List className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
      <p className='text-muted-foreground'>{t('manage_description')}</p>
    </div>
  );
}
