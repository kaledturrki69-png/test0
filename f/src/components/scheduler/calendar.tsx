'use client';

import * as React from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { addDays, format, parse, startOfWeek, getDay } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';

const locales = {
  fr: fr,
  en: enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales
});

const defaultEvents = [
  {
    id: 1,
    title: 'Interview with Alice',
    start: new Date(),
    end: addDays(new Date(), 0.1),
    resourceId: 1
  },
  {
    id: 2,
    title: 'Technical Test (Yasmine)',
    start: addDays(new Date(), 1),
    end: addDays(new Date(), 1.1)
  }
];

function ShadcnToolbar({ date, onNavigate, onView, view, label }: any) {
  const t = useTranslations('calendar');
  const localeCode = useLocale();
  const dfLocale = (locales as Record<string, any>)[localeCode] || enUS;

  let computedLabel = label;
  try {
    const d = date ? new Date(date) : new Date();
    const pattern =
      view === 'month'
        ? 'MMMM yyyy'
        : view === 'week'
          ? 'MMM d, yyyy'
          : view === 'day'
            ? 'PPP'
            : 'PPP';
    computedLabel = format(d, pattern, { locale: dfLocale });
  } catch {}

  const viewLabels: Record<string, string> = {
    month: t('month'),
    week: t('week'),
    day: t('day'),
    agenda: t('agenda')
  };

  return (
    <div className='mb-2 flex items-center justify-between border-b pb-2'>
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' onClick={() => onNavigate('TODAY')}>
          {t('today')}
        </Button>
        <Button variant='outline' size='sm' onClick={() => onNavigate('PREV')}>
          ←
        </Button>
        <Button variant='outline' size='sm' onClick={() => onNavigate('NEXT')}>
          →
        </Button>
        <span className='ml-2 font-semibold'>{computedLabel}</span>
      </div>

      <div className='flex items-center gap-1'>
        {(['month', 'week', 'day', 'agenda'] as const).map((v) => (
          <Button
            key={v}
            size='sm'
            variant={view === v ? 'default' : 'ghost'}
            onClick={() => onView(v)}
            className='capitalize'
          >
            {viewLabels[v] || v}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function SchedulerCalendar() {
  const [events] = React.useState(defaultEvents);
  const [view, setView] = React.useState<View>('month');
  const [date, setDate] = React.useState<Date>(new Date());
  const localeCode = useLocale();

  return (
    <div
      className={cn(
        'bg-background text-foreground rounded-lg border p-4 shadow-sm',
        'rbc-calendar-wrapper'
      )}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor='start'
        endAccessor='end'
        view={view}
        onView={(v) => setView(v)}
        date={date}
        onNavigate={(newDate) => setDate(newDate as unknown as Date)}
        // @ts-expect-error react-big-calendar accepts culture for date-fns localizer at runtime
        culture={localeCode}
        style={{ height: '75vh' }}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          toolbar: (props: any) => <ShadcnToolbar {...props} />
        }}
        popup
      />
    </div>
  );
}
