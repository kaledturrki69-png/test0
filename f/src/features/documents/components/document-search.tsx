'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconX } from '@tabler/icons-react';

export function DocumentSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }

    params.set('page', '1');

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    updateSearch('');
  };

  return (
    <div className='flex flex-wrap items-center gap-2 p-1'>
      {/* Combined Search for First Name and Last Name */}
      <div className='relative'>
        <Input
          placeholder='Search by candidate name...'
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className='h-8 w-60 lg:w-80'
        />
        {searchTerm && (
          <Button
            variant='ghost'
            size='sm'
            className='absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0'
            onClick={clearSearch}
          >
            <IconX className='h-3 w-3' />
          </Button>
        )}
      </div>
    </div>
  );
}
