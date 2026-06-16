import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { locale } = await params;

  if (!session) {
    return redirect(`/${locale}/auth/sign-in`);
  } else {
    redirect(`/${locale}/dashboard/overview`);
  }
}
