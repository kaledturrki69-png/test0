'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  TvMinimalPlay,
  Table as TableIcon,
  ArrowDownWideNarrow
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Position } from '@/types/position';
import { memo } from 'react';

interface SelectedPosition {
  id: number;
  name: string;
}

interface RecruitingHeaderProps {
  selectedPosition: SelectedPosition | null;
  candidatesCount: number;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  onOpenPositionModal: () => void;
  positionSearchQuery: string;
  setPositionSearchQuery: (query: string) => void;
  availablePositions: Position[];
  onSelectPosition: (position: Position) => void;
}

export const RecruitingHeader = memo(function RecruitingHeader({
  selectedPosition,
  candidatesCount,
  viewMode,
  setViewMode,
  onOpenPositionModal,
  positionSearchQuery,
  setPositionSearchQuery,
  availablePositions,
  onSelectPosition
}: RecruitingHeaderProps) {
  const t = useTranslations('recruitment');

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex flex-1 items-center gap-4'>
          <h1 className='text-3xl font-bold'>{t('page_title')}</h1>
          <Button
            onClick={onOpenPositionModal}
            className='flex items-center gap-2'
            aria-label={t('select_position')}
          >
            <ArrowDownWideNarrow className='h-4 w-4' />
            <span className='sr-only'>{t('select_position')}</span>
          </Button>
          <div className='relative max-w-md flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder={t('position_search_placeholder')}
              value={positionSearchQuery}
              onChange={(e) => setPositionSearchQuery(e.target.value)}
              className='pl-9'
            />
            {positionSearchQuery && (
              <div className='bg-popover absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border shadow-md'>
                {availablePositions
                  .filter((position) =>
                    position.name
                      .toLowerCase()
                      .includes(positionSearchQuery.toLowerCase())
                  )
                  .map((position) => (
                    <div
                      key={position.id}
                      className='hover:bg-accent cursor-pointer px-4 py-2'
                      onClick={() => {
                        onSelectPosition(position);
                        setPositionSearchQuery('');
                      }}
                    >
                      <div className='font-medium'>{position.name}</div>
                      <div className='text-muted-foreground text-sm'>
                        {position.category?.name || t('no_category')}
                      </div>
                    </div>
                  ))}
                {availablePositions.filter((position) =>
                  position.name
                    .toLowerCase()
                    .includes(positionSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className='text-muted-foreground px-4 py-2 text-sm'>
                    {t('no_positions_found')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-sm'>
            {t('view_mode')}
          </span>
          <div className='flex rounded-lg border border-gray-200 p-1'>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='h-8 w-8 p-0'
            >
              <TvMinimalPlay className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('table')}
              className='h-8 w-8 p-0'
            >
              <TableIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <p className='text-muted-foreground'>{t('track_recruitment')}</p>
        {selectedPosition && (
          <Badge variant='default' className='bg-blue-600'>
            {t('selected_position', { name: selectedPosition.name })}
          </Badge>
        )}
        {selectedPosition ? (
          <Badge className='bg-blue-600 text-white'>
            {t('matched_candidates', { count: candidatesCount })}
          </Badge>
        ) : (
          <span className='text-muted-foreground'>
            {t('no_position_selected')}
          </span>
        )}
      </div>
    </div>
  );
});
