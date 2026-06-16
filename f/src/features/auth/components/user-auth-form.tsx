'use client';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { FormInput } from '@/components/forms/form-input';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { signIn } from 'next-auth/react';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false
        });

        if (result?.error) {
          toast.error('Login failed. Please check your credentials.');
        } else {
          toast.success('Logged in successfully!');
          window.location.href = callbackUrl || `/${locale}/dashboard/overview`;
        }
      } catch (error: any) {
        toast.error('Login failed. Please check your credentials.');
      }
    });
  };

  return (
    <>
      <Form
        form={form as any}
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full space-y-4'
      >
        <FormInput
          control={form.control}
          name={'email' as any}
          label={t('email')}
          placeholder={t('email')}
          type='email'
          disabled={loading}
        />
        <FormInput
          control={form.control}
          name={'password' as any}
          label={t('password')}
          placeholder={t('password')}
          type='password'
          disabled={loading}
        />
        <Button
          disabled={loading}
          className='mt-6 h-11 w-full text-base font-medium'
          type='submit'
        >
          {t('signInButton')}
        </Button>
        <div className='pt-2 text-center'>
          <Link
            href={{ pathname: '/auth/forgot-password' }}
            className='text-muted-foreground hover:text-primary text-sm underline transition-colors'
          >
            Forgot Password?
          </Link>
        </div>
      </Form>
    </>
  );
}
