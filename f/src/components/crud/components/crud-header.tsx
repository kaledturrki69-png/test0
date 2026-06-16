'use client';

import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { Grid3X3, List } from 'lucide-react';
import { memo } from 'react';

interface CrudHeaderProps {
  title: string;
  subtitle: string;
  addButtonText: string;
  viewLabel: string;
  onAdd: () => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  showForm: boolean;
  loading: boolean;
}

export const CrudHeader = memo(function CrudHeader({
  title,
  subtitle,
  addButtonText,
  viewLabel,
  onAdd,
  viewMode,
  setViewMode,
  showForm,
  loading
}: CrudHeaderProps) {
  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <h2 className='text-3xl font-bold tracking-tight'>{title}</h2>
          <Button
            onClick={onAdd}
            className='flex items-center gap-2'
            disabled={loading}
          >
            <IconPlus className='h-4 w-4' />
            {addButtonText}
          </Button>
        </div>

        {!showForm && (
          <div className='flex items-center space-x-2'>
            <span className='text-muted-foreground text-sm'>{viewLabel}</span>
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
        )}
      </div>
      <p className='text-muted-foreground'>{subtitle}</p>
    </div>
  );
});
