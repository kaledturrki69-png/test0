'use client';

import { useEffect } from 'react';

/**
 * Hook to set the page title dynamically for client components
 * @param title - The title to set (will be appended with " | JekJob")
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title.includes('|') ? title : `${title} | JekJob`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
