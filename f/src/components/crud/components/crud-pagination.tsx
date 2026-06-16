'use client';

import { Button } from '@/components/ui/button';
import { memo } from 'react';

interface CrudPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  showingText: string;
  previousText: string;
  nextText: string;
}

export const CrudPagination = memo(function CrudPagination({
  currentPage,
  totalPages,
  onPageChange,
  showingText,
  previousText,
  nextText
}: CrudPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
      <div className='text-muted-foreground text-sm'>{showingText}</div>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {previousText}
        </Button>
        <div className='flex items-center gap-1'>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size='sm'
              onClick={() => onPageChange(page)}
              className='h-8 w-8 p-0'
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          {nextText}
        </Button>
      </div>
    </div>
  );
});
