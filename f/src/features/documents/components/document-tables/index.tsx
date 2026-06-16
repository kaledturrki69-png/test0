'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useQueryState, parseAsInteger } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';

interface DocumentTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
}

export function DocumentTable<TData, TValue>({
  data,
  totalItems,
  columns
}: DocumentTableParams<TData, TValue>) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));

  // Calculate total pages based on server-side total count
  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pageCount,
    shallow: false,
    debounceMs: 500
  });

  return <DataTable table={table} />;
}
