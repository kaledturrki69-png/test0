'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Product } from '@/constants/data';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle } from 'lucide-react';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { Progress } from '@/components/ui/progress';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'type',
    header: 'TYPE',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <div className='flex items-center gap-2'>
          <span className='capitalize'>{type.toUpperCase()}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'source',
    header: 'SOURCE',
    cell: ({ row }) => {
      const source = row.getValue('source') as string;
      return (
        <div className='flex items-center gap-2'>
          {source === 'app' && (
            <Image src='/assets/android.svg' alt='App' width={16} height={16} />
          )}
          {source === 'email' && (
            <Image src='/assets/email.svg' alt='Email' width={16} height={16} />
          )}
          {source === 'upload' && (
            <Image
              src='/assets/upload.svg'
              alt='Upload'
              width={16}
              height={16}
            />
          )}
          <Badge variant='outline' className='capitalize'>
            {source}
          </Badge>
        </div>
      );
    }
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return (
        <div className='max-w-[200px] truncate' title={name}>
          {name}
        </div>
      );
    },
    meta: {
      label: 'Name',
      placeholder: 'Search by name...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'date',
    header: 'DATE',
    cell: ({ row }) => {
      const date = row.getValue('date') as string;
      return <div className='text-sm'>{date}</div>;
    }
  },
  {
    accessorKey: 'size',
    header: 'SIZE',
    cell: ({ row }) => {
      const size = row.getValue('size') as string;
      return <div className='text-sm'>{size}</div>;
    }
  },
  {
    accessorKey: 'analyse',
    header: 'ANALYSE',
    cell: ({ row }) => {
      const analyse = row.getValue('analyse') as string;

      if (analyse === '100%') {
        return (
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4 text-green-500' />
            <span className='text-green-500'>100%</span>
          </div>
        );
      } else if (analyse === 'error') {
        return (
          <div className='flex items-center gap-2'>
            <XCircle className='h-4 w-4 text-red-500' />
            <span className='text-red-500'>Error</span>
          </div>
        );
      } else if (analyse.includes('%')) {
        const percentage = parseInt(analyse.replace('%', ''));
        return (
          <div className='flex items-center gap-2'>
            <Progress value={percentage} className='w-16' />
            <span className='text-sm'>{analyse}</span>
          </div>
        );
      }

      return <span>{analyse}</span>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
