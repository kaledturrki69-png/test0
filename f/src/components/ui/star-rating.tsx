'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  value?: number; // 0..5
  onChange?: (val: number) => void;
  size?: number;
  readOnly?: boolean;
};

export function StarRating({
  value = 0,
  onChange,
  size = 18,
  readOnly = false
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const active = readOnly ? value : (hover ?? value);

  return (
    <div className='flex items-center gap-1'>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= active;
        return (
          <svg
            key={idx}
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            width={size}
            height={size}
            className={cn(
              'transition-colors',
              !readOnly && 'cursor-pointer',
              filled
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-muted-foreground'
            )}
            onMouseEnter={readOnly ? undefined : () => setHover(idx)}
            onMouseLeave={readOnly ? undefined : () => setHover(null)}
            onClick={readOnly ? undefined : () => onChange?.(idx)}
          >
            <path d='M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.164L12 18.896l-7.335 3.865 1.401-8.164L.132 9.21l8.2-1.192z' />
          </svg>
        );
      })}
    </div>
  );
}
