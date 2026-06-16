'use client';

import { Button } from '@/components/ui/button';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CrudItem } from '../types';
import { memo } from 'react';

interface CrudGridViewProps<T extends CrudItem> {
  items: T[];
  onEdit: (item: T) => void;
  onDelete: (id: number, name: string) => void;
  loading: boolean;
  renderItem?: (
    item: T,
    onEdit: () => void,
    onDelete: () => void
  ) => React.ReactNode;
  getItemName: (item: T) => string;
  getItemDescription: (item: T) => string;
  maxDescriptionLength?: number;
}

export const CrudGridView = memo(function CrudGridView<T extends CrudItem>({
  items,
  onEdit,
  onDelete,
  loading,
  renderItem,
  getItemName,
  getItemDescription,
  maxDescriptionLength = 200
}: CrudGridViewProps<T>) {
  if (renderItem) {
    return (
      <div className='space-y-2'>
        {items.map((item) =>
          renderItem(
            item,
            () => onEdit(item),
            () => onDelete(item.id, getItemName(item))
          )
        )}
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {items.map((item) => {
        const description = getItemDescription(item);
        const truncated =
          description.length > maxDescriptionLength
            ? description.substring(0, maxDescriptionLength) + '...'
            : description;

        return (
          <div
            key={item.id}
            className='flex items-center justify-between gap-3 rounded-md border p-3'
          >
            <div className='min-w-0 flex-1'>
              <div className='text-sm font-medium'>{getItemName(item)}</div>
              <div className='text-muted-foreground text-xs break-words'>
                {truncated}
              </div>
            </div>
            <div className='flex flex-shrink-0 gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onEdit(item)}
                disabled={loading}
              >
                <IconEdit className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onDelete(item.id, getItemName(item))}
                disabled={loading}
              >
                <IconTrash className='h-4 w-4' />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}) as <T extends CrudItem>(props: CrudGridViewProps<T>) => React.ReactElement;
