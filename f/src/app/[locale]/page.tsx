import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function LocaleHomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { locale } = await params;
  if (!session) {
    return redirect(`/${locale}/auth/sign-in`);
  }
  redirect(`/${locale}/dashboard/overview`);
}
