'use client';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition } from 'react';
import { FormInput } from '@/components/forms/form-input';
import { toast } from 'sonner';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { authService } from '@/services/auth-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/routing';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().min(6, 'Code must be at least 6 characters'),
  new_password: z.string().min(6, 'Password must be at least 6 characters')
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordForm() {
  const [loading, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const emailFromUrl = searchParams.get('email') || '';

  // Extract current locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: emailFromUrl,
      code: '',
      new_password: ''
    }
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await authService.resetPassword({
          email: values.email,
          code: values.code,
          new_password: values.new_password
        });

        toast.success('Password reset successfully!');
        router.push(`/${locale}/auth/sign-in`);
      } catch (e: any) {
        toast.error(e.message || 'Failed to reset password');
      }
    });
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-center text-2xl font-bold'>
          Reset Password
        </CardTitle>
        <p className='text-muted-foreground text-center'>
          Enter the code you received and your new password.
        </p>
      </CardHeader>
      <CardContent>
        <Form
          form={form as any}
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-4'
        >
          <FormInput
            control={form.control}
            name={'email' as any}
            type='email'
            label='Email'
            placeholder='Enter your email'
            disabled={loading || !!emailFromUrl}
          />
          <FormInput
            control={form.control}
            name={'code' as any}
            label='Reset Code'
            placeholder='Enter the code from your email'
            disabled={loading}
          />
          <FormInput
            control={form.control}
            name={'new_password' as any}
            type='password'
            label='New Password'
            placeholder='Enter your new password'
            disabled={loading}
          />
          <Button disabled={loading} className='mt-2 w-full' type='submit'>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Form>

        <div className='mt-4 text-center'>
          <Link
            href={{ pathname: '/auth/sign-in' }}
            className='text-muted-foreground hover:text-primary text-sm underline transition-colors'
          >
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
