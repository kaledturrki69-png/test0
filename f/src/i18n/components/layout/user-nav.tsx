'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconUser, IconLogout } from '@tabler/icons-react';
export function UserNav() {
  const { data } = useSession();
  const user = data?.user as
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        firstName?: string | null;
        lastName?: string | null;
      }
    | undefined;

  // Debug: Log user data to see what we're getting
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('dashboard');

  // Extract current locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  // Always show user nav with default user.svg icon
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full'>
            <IconUser className='text-primary h-4 w-4' />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56'
        align='end'
        sideOffset={10}
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.name || 'User'}
            </p>
            <p className='text-muted-foreground text-xs leading-none'>
              {user?.email || 'No email'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push(`/${locale}/dashboard/profile`)}
          >
            <IconUser className='mr-2 h-4 w-4' />
            {t('profile')}
          </DropdownMenuItem>
          {/* <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}/auth/sign-in` })}
            className='flex w-full items-center'
          >
            <IconLogout className='mr-2 h-4 w-4' />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
