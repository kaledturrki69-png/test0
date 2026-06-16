import SchedulerCalendar from '@/components/scheduler/calendar';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('calendar');

  return (
    <div className='container px-10 py-6'>
      <h1 className='mb-4 text-2xl font-bold'>{t('title')}</h1>
      <SchedulerCalendar />
    </div>
  );
}
