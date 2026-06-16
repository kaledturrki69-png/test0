'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Condition } from '@/types/condition';
import { X } from 'lucide-react';

interface ConditionSelectorProps {
  title: string;
  availableConditions: Condition[];
  selectedConditionIds: number[];
  onAdd: (conditionId: number) => void;
  onRemove: (conditionId: number) => void;
  isViewMode?: boolean;
  loading?: boolean;
  selectPlaceholder?: string;
}

export function ConditionSelector({
  title,
  availableConditions,
  selectedConditionIds,
  onAdd,
  onRemove,
  isViewMode = false,
  loading = false,
  selectPlaceholder = 'Select condition'
}: ConditionSelectorProps) {
  const selectedConditions = availableConditions.filter((c) =>
    selectedConditionIds.includes(c.id)
  );
  const unselectedConditions = availableConditions.filter(
    (c) => !selectedConditionIds.includes(c.id)
  );

  const handleAddCondition = (conditionIdStr: string) => {
    const conditionId = parseInt(conditionIdStr);
    onAdd(conditionId);
  };

  return (
    <>
      <Separator />
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <div className='font-medium'>{title}</div>
          {!isViewMode && (
            <Select
              onValueChange={handleAddCondition}
              disabled={loading || unselectedConditions.length === 0}
            >
              <SelectTrigger className='w-48'>
                <SelectValue placeholder={selectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {unselectedConditions.map((condition) => (
                  <SelectItem
                    key={condition.id}
                    value={condition.id.toString()}
                  >
                    {condition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className='space-y-2'>
          {selectedConditions.length === 0 ? (
            <div className='text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm'>
              No conditions selected yet
            </div>
          ) : (
            selectedConditions.map((condition) => (
              <div
                key={condition.id}
                className='flex items-center justify-between gap-3 rounded-md border p-2'
              >
                <div className='flex-1'>
                  <div className='text-sm font-medium'>{condition.name}</div>
                  <div className='text-muted-foreground text-xs'>
                    {condition.description}{' '}
                    {condition.formula ? `(Formula: ${condition.formula})` : ''}
                  </div>
                </div>
                {!isViewMode && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onRemove(condition.id)}
                    disabled={loading}
                    className='h-8 w-8 p-0'
                  >
                    <X className='text-muted-foreground h-4 w-4' />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
