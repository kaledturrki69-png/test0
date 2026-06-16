'use client';

import { Document } from '@/types/document';
import { DocumentTable } from './document-tables';
import { columns } from './document-tables/columns';

interface DocumentTableWrapperProps {
  documents: Document[];
  totalDocuments: number;
}

export function DocumentTableWrapper({
  documents,
  totalDocuments
}: DocumentTableWrapperProps) {
  return (
    <DocumentTable
      data={documents}
      totalItems={totalDocuments}
      columns={columns}
    />
  );
}
