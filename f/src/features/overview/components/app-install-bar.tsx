'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

/* -------------------------------------------------------------------------- */
/*                       📈 Static Monthly Install & Interaction Data          */
/* -------------------------------------------------------------------------- */
const chartData = [
  { month: 'Jan', installs: 1200, interactions: 4800 },
  { month: 'Feb', installs: 1600, interactions: 5500 },
  { month: 'Mar', installs: 1900, interactions: 6200 },
  { month: 'Apr', installs: 2200, interactions: 7100 },
  { month: 'May', installs: 2500, interactions: 8200 },
  { month: 'Jun', installs: 2700, interactions: 9100 },
  { month: 'Jul', installs: 3100, interactions: 10400 },
  { month: 'Aug', installs: 2900, interactions: 9800 },
  { month: 'Sep', installs: 3300, interactions: 11200 },
  { month: 'Oct', installs: 3500, interactions: 11900 },
  { month: 'Nov', installs: 4100, interactions: 13500 },
  { month: 'Dec', installs: 4600, interactions: 14800 }
];

/* -------------------------------------------------------------------------- */
/*                               Chart Config                                 */
/* -------------------------------------------------------------------------- */
const chartConfig = {
  installs: {
    label: 'App Installs',
    color: 'var(--chart-1)'
  },
  interactions: {
    label: 'Candidate Interactions',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */
export default function UserInteractionsChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('interactions');

  const total = React.useMemo(
    () => ({
      installs: chartData.reduce((acc, curr) => acc + curr.installs, 0),
      interactions: chartData.reduce((acc, curr) => acc + curr.interactions, 0)
    }),
    []
  );

  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);
  if (!isClient) return null;

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>User Interactions</CardTitle>
          <CardDescription>
            Number of app installs vs total candidate interactions per month
          </CardDescription>
        </div>

        <div className='flex'>
          {(['installs', 'interactions'] as const).map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-2xl'>
                  {total[key].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            data={chartData}
            margin={{ left: 12, right: 12 }}
            barGap={4}
            barCategoryGap='30%'
          >
            <defs>
              <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='var(--primary)'
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey={activeChart}
                  labelFormatter={(value) => `Month: ${value}`}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill='url(#fillBar)'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
