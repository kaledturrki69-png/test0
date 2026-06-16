'use client';

import { Document } from '@/types/document';
import { DocumentService } from '@/services/documentService';
import { DocumentTableWrapper } from './document-table-wrapper';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';

type DocumentListingPage = {};

export default function DocumentListingPage({}: DocumentListingPage) {
  const { data: session, status } = useSession();
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [searchTerm] = useQueryState('search', { defaultValue: '' });

  // Fetch all documents once
  useEffect(() => {
    const fetchAllDocuments = async () => {
      if (status === 'loading') return;

      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all documents (no pagination from server)
        const response = await DocumentService.getDocuments({
          page: 1,
          limit: 1000,
          search: searchTerm || undefined
        });

        setAllDocuments(response.documents);
      } catch (error) {
        if (error instanceof Error && error.message.includes('token expired')) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError('Failed to load documents. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllDocuments();
  }, [session, status, searchTerm]);

  const { paginatedDocuments, totalDocuments } = useMemo(() => {
    // Apply search filter first
    let filteredDocs = allDocuments;
    if (searchTerm) {
      filteredDocs = allDocuments.filter((doc: any) => {
        const candidate = doc.candidate;
        if (!candidate) return false;

        const firstName = candidate.first_name?.toLowerCase() || '';
        const lastName = candidate.last_name?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();

        return firstName.includes(search) || lastName.includes(search);
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

    return {
      paginatedDocuments: paginatedDocs,
      totalDocuments: filteredDocs.length
    };
  }, [allDocuments, page, pageSize, searchTerm]);

  if (status === 'loading' || loading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='text-center'>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
          <p className='mt-2'>Loading documents...</p>
        </div>
      </div>
    );
  }

  if (!session?.accessToken) {
    return (
      <div className='container mx-auto py-6'>
        <div className='text-center'>
          <h2 className='mb-4 text-2xl font-bold'>Authentication Required</h2>
          <p className='text-gray-600'>Please log in to view documents.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto py-6'>
        <div className='text-center'>
          <h2 className='mb-4 text-2xl font-bold'>Error Loading Documents</h2>
          <p className='text-red-600'>{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state when no documents exist
  if (allDocuments.length === 0 && !loading) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-12'>
        <div className='mx-auto flex max-w-[420px] flex-col items-center justify-center text-center'>
          <svg
            className='text-muted-foreground mb-4 h-16 w-16'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
          <h3 className='mt-4 text-lg font-semibold'>No CV uploaded</h3>
          <p className='text-muted-foreground mt-2 mb-4 text-sm'>
            You haven&apos;t uploaded any CV documents yet. Upload your first CV
            to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DocumentTableWrapper
      documents={paginatedDocuments}
      totalDocuments={totalDocuments}
    />
  );
}
