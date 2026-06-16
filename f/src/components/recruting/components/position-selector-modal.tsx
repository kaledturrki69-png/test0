'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Position } from '@/types/position';
import { memo } from 'react';

interface SelectedPosition {
  id: number;
  name: string;
}

interface PositionSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePositions: Position[];
  selectedPosition: SelectedPosition | null;
  onSelectPosition: (position: Position) => void;
}

export const PositionSelectorModal = memo(function PositionSelectorModal({
  open,
  onOpenChange,
  availablePositions,
  selectedPosition,
  onSelectPosition
}: PositionSelectorModalProps) {
  const t = useTranslations('recruitment');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{t('select_position')}</DialogTitle>
        </DialogHeader>
        <ScrollArea className='max-h-[60vh] pr-4'>
          <div className='space-y-2'>
            {availablePositions.length === 0 ? (
              <div className='text-muted-foreground py-8 text-center'>
                <Users className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                <p>{t('no_positions_available')}</p>
              </div>
            ) : (
              availablePositions.map((position) => {
                const isSelected = selectedPosition?.id === position.id;
                return (
                  <Card
                    key={position.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-2 border-blue-500 bg-blue-50/50'
                        : 'border hover:border-blue-300'
                    }`}
                    onClick={() => onSelectPosition(position)}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex min-w-0 flex-1 items-start gap-3'>
                          <Users
                            className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                              isSelected ? 'text-blue-600' : 'text-gray-400'
                            }`}
                          />
                          <div className='min-w-0 flex-1'>
                            <h3
                              className={`text-base font-semibold break-words ${
                                isSelected ? 'text-blue-700' : 'text-gray-900'
                              }`}
                            >
                              {position.name}
                            </h3>
                            <p className='text-muted-foreground mt-1 text-sm'>
                              {position.category?.name || t('no_category')}
                            </p>
                            <div className='mt-2 flex flex-wrap gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                {t('soft_skills_count', {
                                  count: position.soft_skills.length
                                })}
                              </Badge>
                              <Badge variant='outline' className='text-xs'>
                                {t('hard_skills_count', {
                                  count: position.hard_skills.length
                                })}
                              </Badge>
                              <Badge variant='outline' className='text-xs'>
                                {t('conditions_count', {
                                  count: position.conditions.length
                                })}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className='flex flex-shrink-0 flex-col items-end gap-2'>
                            <Badge variant='default' className='bg-blue-600'>
                              {t('selected_badge')}
                            </Badge>
                            <span className='text-xs text-blue-600'>
                              {t('clear_selection_tooltip')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          <ScrollBar />
        </ScrollArea>
        <div className='mt-4 flex justify-end'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
