'use client';

import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// Store for dynamic breadcrumb titles (e.g., position names)
const dynamicTitles = new Map<string, string>();

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/employee': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Employee', link: '/dashboard/employee' }
  ],
  '/dashboard/product': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Product', link: '/dashboard/product' }
  ]
  // Add more custom mappings as needed
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);

  // Listen for breadcrumb update events
  useEffect(() => {
    const handleBreadcrumbUpdate = (event: CustomEvent) => {
      const { pathname: updatedPathname, title } = event.detail;
      if (updatedPathname === pathname) {
        dynamicTitles.set(pathname, title);
        setDynamicTitle(title);
      }
    };

    window.addEventListener(
      'breadcrumb-update',
      handleBreadcrumbUpdate as EventListener
    );

    // Check if there's already a dynamic title for this pathname
    // Only use it if this pathname matches a workflow designer route pattern
    const isWorkflowDesignerPath = pathname.includes('/workflows/designer/');
    if (isWorkflowDesignerPath) {
      const existingTitle = dynamicTitles.get(pathname);
      if (existingTitle) {
        setDynamicTitle(existingTitle);
      }
    } else {
      // Clear dynamic title if we're not on a workflow designer page
      setDynamicTitle(null);
    }

    return () => {
      window.removeEventListener(
        'breadcrumb-update',
        handleBreadcrumbUpdate as EventListener
      );
    };
  }, [pathname]);

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    const isWorkflowDesignerPath = pathname.includes('/workflows/designer/');

    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      let title = segment.charAt(0).toUpperCase() + segment.slice(1);

      // If this is the last segment and we have a dynamic title AND we're on the workflow designer page, use it
      if (
        index === segments.length - 1 &&
        dynamicTitle &&
        isWorkflowDesignerPath
      ) {
        title = dynamicTitle;
      }

      return {
        title,
        link: path
      };
    });
  }, [pathname, dynamicTitle]);

  return breadcrumbs;
}
