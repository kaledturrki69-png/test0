'use client';

import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import DocumentListingPage from '@/features/documents/components/document-listing';
import { CandidatesListingPage } from '@/features/documents/components/candidates-listing';
import { useQueryState } from 'nuqs';

type ProfilesContentProps = {
  refreshTrigger?: number;
};

export function ProfilesContent({ refreshTrigger }: ProfilesContentProps) {
  const [tab] = useQueryState('tab', { defaultValue: 'candidates' });

  return (
    <div className='w-full'>
      {tab === 'uploads' ? (
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={8} rowCount={8} filterCount={2} />
          }
        >
          <DocumentListingPage />
        </Suspense>
      ) : (
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={1} />
          }
        >
          <CandidatesListingPage refreshTrigger={refreshTrigger} />
        </Suspense>
      )}
    </div>
  );
}
