'use client';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTransition } from 'react';
import { FormInput } from '@/components/forms/form-input';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/routing';

const schema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  // const t = useTranslations('auth');
  const [loading, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  // Extract current locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await authService.forgotPassword({
          email: values.email
        });

        toast.success('Code sent to your email!');
        // Redirect to reset password page with email and locale
        router.push(
          `/${locale}/auth/reset-password?email=${encodeURIComponent(values.email)}`
        );
      } catch (e: any) {
        toast.error(e.response?.data?.detail || 'Failed to send reset code');
      }
    });
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-center text-2xl font-bold'>
          Forgot Password
        </CardTitle>
        <p className='text-muted-foreground text-center'>
          Enter your email address and we&apos;ll send you a code to reset your
          password.
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
            disabled={loading}
          />
          <Button disabled={loading} className='mt-2 w-full' type='submit'>
            {loading ? 'Sending...' : 'Send Reset Code'}
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
