declare module 'react-big-calendar' {
  import * as React from 'react';

  export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

  export interface Event {
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
  }

  export interface CalendarProps {
    events: Event[];
    view?: View;
    date?: Date;
    defaultView?: View;
    startAccessor?: string | ((event: Event) => Date);
    endAccessor?: string | ((event: Event) => Date);
    titleAccessor?: string | ((event: Event) => string);
    onView?: (view: View) => void;
    onNavigate?: (action: string, newDate: Date) => void;
    onSelectEvent?: (event: Event) => void;
    localizer: any;
    style?: React.CSSProperties;
    components?: Record<string, any>;
    popup?: boolean;
  }

  export const Calendar: React.FC<CalendarProps>;
  export const dateFnsLocalizer: (config: any) => any;
}
