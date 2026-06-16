'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { IconUser } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MatchItem {
  id: number;
  candidate_name: string;
  position_name: string;
  score: number;
  avatar_url?: string | null;
}

export function TopMatches() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch('/api/dashboard/top-matches');
        if (!res.ok) throw new Error('Failed to fetch matches');
        const data = await res.json();
        setMatches(data.results || []);
      } catch (err) {
        // Error silently ignored - component shows loading state
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Top Matches</CardTitle>
        <CardDescription>
          Best candidate–position matches for your company
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='flex items-center space-x-4'>
                <Skeleton className='h-9 w-9 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-[60%]' />
                  <Skeleton className='h-4 w-[40%]' />
                </div>
                <Skeleton className='h-4 w-10' />
              </div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className='space-y-6'>
            {matches.map((m) => (
              <div key={m.id} className='flex items-center'>
                <Avatar className='h-9 w-9'>
                  {m.avatar_url ? (
                    <AvatarImage src={m.avatar_url} alt={m.candidate_name} />
                  ) : (
                    <div className='bg-muted flex h-full w-full items-center justify-center'>
                      <IconUser className='text-muted-foreground h-4 w-4' />
                    </div>
                  )}
                  <AvatarFallback>
                    {m.candidate_name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>

                <div className='ml-4 space-y-1'>
                  <p className='text-sm leading-none font-medium'>
                    {m.candidate_name}
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    {m.position_name}
                  </p>
                </div>

                <div
                  className={cn(
                    'ml-auto font-semibold',
                    m.score >= 0.8
                      ? 'text-green-600'
                      : m.score >= 0.6
                        ? 'text-blue-600'
                        : 'text-muted-foreground'
                  )}
                >
                  {(m.score * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-muted-foreground py-6 text-center text-sm'>
            No match data available yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
