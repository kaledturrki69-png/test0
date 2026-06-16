'use client';

import { Card, CardContent } from '@/components/ui/card';
import { IconPlus } from '@tabler/icons-react';
import { memo } from 'react';

interface CrudEmptyStatesProps {
  type: 'loading' | 'empty';
  loadingText?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const CrudEmptyStates = memo(function CrudEmptyStates({
  type,
  loadingText = 'Loading...',
  emptyTitle = 'No items yet',
  emptyDescription = 'Create your first item to get started'
}: CrudEmptyStatesProps) {
  if (type === 'loading') {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <p className='text-muted-foreground text-lg font-medium'>
            {loadingText}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className='flex flex-col items-center justify-center py-12'>
        <IconPlus className='mx-auto mb-4 h-12 w-12 opacity-50' />
        <p className='mb-2 text-lg font-medium'>{emptyTitle}</p>
        <p className='text-sm'>{emptyDescription}</p>
      </CardContent>
    </Card>
  );
});
