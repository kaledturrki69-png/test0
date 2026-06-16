'use client';

import { useTranslations } from 'next-intl';
import { NavItem } from '@/types';

export function useNavItems(): NavItem[] {
  const t = useTranslations('Nav'); // ✅ namespace Nav

  return [
    {
      title: t('dashboard'),
      url: '/dashboard/overview',
      icon: 'dashboard',
      isActive: true,
      shortcut: ['d', 'd'],
      items: []
    },
    {
      title: t('recruting'),
      url: '/dashboard/recruting',
      icon: 'users',
      shortcut: ['c', 'o'],
      isActive: true,
      items: [
        {
          title: t('positions_overview'),
          url: '/dashboard/positions-overview',
          icon: 'post',
          shortcut: ['o', 'o'],
          isActive: false,
          items: []
        },
        {
          title: t('calendar'),
          url: '/dashboard/calendar',
          icon: 'check',
          shortcut: ['o', 'o'],
          isActive: false,
          items: []
        }
      ]
    },

    {
      title: t('profiles_db'),
      url: '#',
      icon: 'upload',
      shortcut: ['p', 'd'],
      isActive: true,
      items: [
        {
          title: t('candidates'),
          url: '/dashboard/candidates',
          icon: 'post',
          shortcut: ['c', 'c']
        },
        {
          title: t('uploads'),
          url: '/dashboard/upload-cv',
          icon: 'post',
          shortcut: ['u', 'u']
        }
      ]
    },
    {
      title: t('job_positions'),
      url: '#',
      icon: 'billing',
      isActive: true,
      items: [
        {
          title: t('positions'),
          url: '/dashboard/positions',
          icon: 'post',
          shortcut: ['p', 'p']
        },
        {
          title: t('soft_skills'),
          url: '/dashboard/soft-skills',
          icon: 'post',
          shortcut: ['s', 's']
        },
        {
          title: t('hard_skills'),
          url: '/dashboard/hard-skills',
          icon: 'post',
          shortcut: ['h', 'h']
        },
        {
          title: t('conditions'),
          url: '/dashboard/conditions',
          icon: 'post',
          shortcut: ['c', 'c']
        },
        {
          title: t('quizzes'),
          url: '/dashboard/quizzes',
          icon: 'post',
          shortcut: ['q', 'q']
        }
        /*  {
          title: t('workflow'),
          url: `/dashboard/workflows/designer/5`,
          icon: 'post',
          shortcut: ['c', 'c']
        } */
      ]
    }
  ];
}
