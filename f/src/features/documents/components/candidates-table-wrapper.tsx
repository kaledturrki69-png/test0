'use client';

import { Document } from '@/types/document';
import { DocumentTable } from './document-tables';
import { candidatesColumns } from './document-tables/candidates-columns';

interface CandidatesTableWrapperProps {
  documents: Document[];
  totalDocuments: number;
}

export function CandidatesTableWrapper({
  documents,
  totalDocuments
}: CandidatesTableWrapperProps) {
  return (
    <DocumentTable
      data={documents}
      totalItems={totalDocuments}
      columns={candidatesColumns}
    />
  );
}
