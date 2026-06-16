'use client';
import { useSession } from 'next-auth/react';
import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconUser, IconMail, IconLock } from '@tabler/icons-react';
import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/services/auth-service';

export default function ProfileViewPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | { name?: string | null; email?: string | null; image?: string | null }
    | undefined;
  const t = useTranslations('profile');
  const router = useRouter();
  const pathname = usePathname();

  // Extract current locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  const [profileData, setProfileData] = useState<{
    name?: string;
    email?: string;
    imageBase64?: string;
  } | null>(null);

  // Decode JWT token to get user data
  const tokenData = useMemo(() => {
    try {
      const token: string | undefined = (session as any)?.accessToken;
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length < 2) return null;
      // Base64URL decode
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const json = atob(padded);
      const payload = JSON.parse(json);
      return payload;
    } catch {
      return null;
    }
  }, [session]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('profile');
      if (raw) {
        const parsed = JSON.parse(raw) as {
          name?: string;
          email?: string;
          imageBase64?: string;
        };
        setProfileData(parsed);
      } else {
        setProfileData({
          name: sessionUser?.name || '',
          email: sessionUser?.email || ''
        });
      }
    } catch {}
  }, [sessionUser?.name, sessionUser?.email, sessionUser?.image]);

  const displayName =
    profileData?.name ||
    sessionUser?.name ||
    `${tokenData?.first_name || ''} ${tokenData?.last_name || ''}`.trim() ||
    'User';
  const displayEmail =
    profileData?.email || sessionUser?.email || tokenData?.email || '';

  const handleResetPassword = async () => {
    try {
      if (!displayEmail) {
        toast.error('Email not found');
        return;
      }

      await authService.forgotPassword({ email: displayEmail });
      toast.success('Reset code sent to your email!');
      router.push(
        `/${locale}/auth/reset-password?email=${encodeURIComponent(displayEmail)}`
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset code');
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center gap-4'>
            <h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
          </div>
          <p className='text-muted-foreground'>
            View and manage your profile information
          </p>
        </div>
        <Separator />

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {/* Profile Overview Card */}
          <Card className='col-span-full'>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <div className='bg-primary/10 flex h-16 w-16 items-center justify-center rounded-lg'>
                  <IconUser className='text-primary h-8 w-8' />
                </div>
                <div>
                  <CardTitle className='text-2xl'>{displayName}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='flex items-start gap-3'>
                  <IconUser className='text-muted-foreground mt-1 h-5 w-5' />
                  <div>
                    <p className='text-sm font-medium'>{t('name')}</p>
                    <p className='text-muted-foreground text-sm'>
                      {displayName}
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <IconMail className='text-muted-foreground mt-1 h-5 w-5' />
                  <div>
                    <p className='text-sm font-medium'>{t('email')}</p>
                    <p className='text-muted-foreground text-sm'>
                      {displayEmail}
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <IconLock className='text-muted-foreground mt-1 h-5 w-5' />
                  <div>
                    <p className='text-sm font-medium'>Password</p>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleResetPassword}
                      className='mt-1'
                    >
                      Reset Password
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
