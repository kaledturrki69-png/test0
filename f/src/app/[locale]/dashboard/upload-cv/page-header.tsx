'use client';

import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { DocumentSearch } from '@/features/documents/components/document-search';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type PageHeaderProps = {
  locale: string;
  onRefresh: () => void;
};

export function PageHeader({ locale, onRefresh }: PageHeaderProps) {
  const t = useTranslations('ProfilesPageHeader');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    // Reset the spinning animation after a short delay
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
          <Link href={`/${locale}/dashboard/upload`}>
            <Button className='whitespace-nowrap' title={t('add_profile')}>
              <IconPlus className='mr-2 h-4 w-4' />
            </Button>
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={handleRefresh}
            className='flex-shrink-0'
            title={t('reload')}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
          <DocumentSearch />
        </div>
      </div>
      <p className='text-muted-foreground'>{t('subtitle')}</p>
    </div>
  );
}
