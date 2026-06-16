import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

export interface GridCardItem {
  id: number | string;
  title: string;
  subtitle?: string;
  description?: string;
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  }>;
  statusBadge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
  details?: Array<{
    icon: ReactNode;
    label: string;
    value: string;
  }>;
  avatar?: ReactNode;
  actionButton?: {
    label: string;
    onClick: (e: React.MouseEvent) => void;
  };
  onClick?: () => void;
  extraContent?: ReactNode;
}

interface GridCardViewProps {
  items: GridCardItem[];
  emptyState?: {
    icon: ReactNode;
    title: string;
    description: string;
  };
  columns?: {
    default?: number;
    md?: number;
    lg?: number;
  };
}

export function GridCardView({
  items,
  emptyState,
  columns = { default: 1, md: 2, lg: 3 }
}: GridCardViewProps) {
  const getGridCols = () => {
    const classes = [];
    classes.push(`grid-cols-${columns.default || 1}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    return classes.join(' ');
  };

  if (items.length === 0 && emptyState) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          {emptyState.icon}
          <h3 className='mb-2 text-lg font-semibold'>{emptyState.title}</h3>
          <p className='text-muted-foreground text-center'>
            {emptyState.description}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid gap-6 ${getGridCols()}`}>
      {items.map((item) => (
        <Card
          key={item.id}
          className={`transition-all duration-200 ${
            item.onClick
              ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'
              : 'hover:shadow-lg'
          }`}
          onClick={item.onClick}
        >
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex flex-1 items-center gap-3'>
                {item.avatar && <div>{item.avatar}</div>}
                <div className='flex-1'>
                  <CardTitle className='line-clamp-2 text-lg'>
                    {item.title}
                  </CardTitle>
                  {item.subtitle && (
                    <p className='text-muted-foreground mt-1 text-sm'>
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
              {item.statusBadge && (
                <Badge
                  variant={item.statusBadge.variant || 'default'}
                  className='ml-2 flex-shrink-0'
                >
                  {item.statusBadge.label}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* Description */}
            {item.description && (
              <p className='text-muted-foreground line-clamp-3 text-sm'>
                {item.description}
              </p>
            )}

            {/* Details */}
            {item.details && item.details.length > 0 && (
              <div className='space-y-2 text-sm'>
                {item.details.map((detail, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    {detail.icon}
                    <span className='text-muted-foreground'>
                      {detail.label}:
                    </span>
                    <span className='font-medium'>{detail.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Badges */}
            {item.badges && item.badges.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {item.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant={badge.variant || 'outline'}
                    className='text-xs'
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Extra Content */}
            {item.extraContent}

            {/* Action Button */}
            {item.actionButton && (
              <Button
                className='w-full'
                onClick={(e) => {
                  e.stopPropagation();
                  item.actionButton?.onClick(e);
                }}
              >
                {item.actionButton.label}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
