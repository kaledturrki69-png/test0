'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition } from 'react';
import { FormInput } from '@/components/forms/form-input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string()
});

type FormValues = z.infer<typeof schema>;

export default function RegisterForm() {
  const t = useTranslations('auth');
  const [loading, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Extract current locale from pathname
  const locale = pathname.split('/')[1] || 'en';
  const callbackUrl =
    searchParams.get('callbackUrl') || `/${locale}/auth/sign-in`;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      role: 'candidate'
    }
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Registration failed');
        }
        toast.success('Registered successfully. You can sign in now.');
        router.push(callbackUrl);
      } catch (e: any) {
        toast.error(e.message || 'Registration failed');
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-2'>
      <FormInput
        control={form.control}
        name={'email' as any}
        type='email'
        label={t('email')}
        placeholder={t('email')}
        disabled={loading}
      />
      <FormInput
        control={form.control}
        name={'password' as any}
        type='password'
        label={t('password')}
        placeholder={t('password')}
        disabled={loading}
      />
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Role</label>
        <select
          {...form.register('role')}
          disabled={loading}
          className='w-full rounded-md border p-2'
        >
          <option value='candidate'>Candidate</option>
          <option value='employer'>Employer</option>
        </select>
      </div>
      <Button disabled={loading} className='mt-2 ml-auto w-full' type='submit'>
        {t('createAccount')}
      </Button>
    </form>
  );
}
