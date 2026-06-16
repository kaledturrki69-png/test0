'use client';

import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ServerStatus } from '@/features/documents/components/server-status';
import { PageHeader } from './page-header';
import { ProfilesContent } from './profiles-content';

type PageWrapperProps = {
  locale: string;
};

export function PageWrapper({ locale }: PageWrapperProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <PageHeader locale={locale} onRefresh={handleRefresh} />
      <Separator />
      <ServerStatus />
      <ProfilesContent refreshTrigger={refreshTrigger} />
    </div>
  );
}
