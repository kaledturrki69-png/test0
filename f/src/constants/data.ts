import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
  // New CV fields
  type: 'pdf' | 'word';
  source: 'upload' | 'app' | 'email';
  filename: string;
  date: string;
  size: string;
  analyse: string; // "100%", "40%", "error", etc.
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: true,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },

  {
    title: 'Recruting',
    url: '/dashboard/recruting',
    icon: 'users',
    shortcut: ['c', 'o'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Overview',
    url: '/dashboard/positions-overview',
    icon: 'post',
    shortcut: ['o', 'o'],
    isActive: false,
    items: []
  },
  {
    title: 'Calendar',
    url: '/dashboard/calendar',
    icon: 'post',
    shortcut: ['c', 'c'],
    isActive: true,
    items: [] // No child items
  },
  {
    title: 'Profiles DB',
    url: '#',
    icon: 'upload',
    shortcut: ['p', 'd'],
    isActive: true,
    items: [
      {
        title: 'Candidates',
        url: '/dashboard/candidates',
        icon: 'post',
        shortcut: ['c', 'c']
      },
      {
        title: 'Uploads',
        url: '/dashboard/upload-cv',
        icon: 'post',
        shortcut: ['u', 'u']
      }
    ]
  },

  {
    title: 'Job Positons',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'Positons',
        url: '/dashboard/positions',
        icon: 'post',
        shortcut: ['p', 'p']
      },
      {
        title: 'Soft Skills',
        url: '/dashboard/soft-skills',
        icon: 'post',
        shortcut: ['s', 's']
      },
      {
        title: 'Hard Skills',
        url: '/dashboard/hard-skills',
        icon: 'post',
        shortcut: ['h', 'h']
      },
      {
        title: 'Conditions',
        url: '/dashboard/conditions',
        icon: 'post',
        shortcut: ['c', 'c']
      },
      {
        title: 'Quizzes',
        url: '/dashboard/quizzes',
        icon: 'post',
        shortcut: ['q', 'q']
      }
    ]
  }

  /*  {
    title: 'Account',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      }
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/',
        icon: 'login'
      } 
    ]
  }*/

  /* {
    title: 'Kanban',
    url: '/dashboard/kanban',
    icon: 'kanban',
    shortcut: ['k', 'k'],
    isActive: false,
    items: [] // No child items
  } */
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
