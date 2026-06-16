'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { Search, Loader2, Briefcase, Calendar, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Position } from '@/types/position';
import { useRouter, useParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { GridCardView, GridCardItem } from '@/components/views';
import { usePageTitle } from '@/hooks/use-page-title';

export default function PositionsOverviewPage() {
  usePageTitle('Positions Overview');
  const t = useTranslations('positions_overview');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { data: session } = useSession();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPositions = useCallback(async () => {
    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/positions', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }

      const data = await response.json();
      setPositions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(t('failed_to_load'));
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, t]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchPositions();
    }
  }, [session?.accessToken, fetchPositions]);

  const filteredPositions = positions.filter((position) => {
    const matchesSearch =
      position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (position.category?.name &&
        position.category.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      position.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handlePositionClick = (positionId: number) => {
    router.push(`/${locale}/dashboard/recruting?positionId=${positionId}`);
  };

  // Transform positions to GridCardItems
  const gridItems: GridCardItem[] = filteredPositions.map((position) => ({
    id: position.id,
    title: position.name,
    subtitle: position.category?.name || t('no_category'),
    description: position.description.replace(/<[^>]*>/g, '').substring(0, 150),
    statusBadge: {
      label: position.status === 'open' ? t('open') : t('closed'),
      variant: position.status === 'open' ? 'default' : 'secondary'
    },
    details: [
      {
        icon: <Calendar className='text-muted-foreground h-4 w-4' />,
        label: t('expected_date'),
        value: position.expected_hiring_date
      },
      {
        icon: <Users className='text-muted-foreground h-4 w-4' />,
        label: t('to_hire'),
        value: position.number_to_hire.toString()
      },
      ...(position.workplace_name
        ? [
            {
              icon: <Briefcase className='text-muted-foreground h-4 w-4' />,
              label: t('workplace'),
              value: position.workplace_name
            }
          ]
        : [])
    ],
    badges: [
      {
        label: `${position.soft_skills.length} ${t('soft_skills')}`,
        variant: 'outline'
      },
      {
        label: `${position.hard_skills.length} ${t('hard_skills')}`,
        variant: 'outline'
      },
      {
        label: `${position.conditions.length} ${t('conditions')}`,
        variant: 'outline'
      }
    ],
    actionButton: {
      label: t('view_candidates'),
      onClick: (e) => {
        e.stopPropagation();
        handlePositionClick(position.id);
      }
    },
    onClick: () => handlePositionClick(position.id)
  }));

  if (loading) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>{t('loading')}</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                {t('title')}
              </h1>
              <p className='text-muted-foreground mt-1'>{t('subtitle')}</p>
            </div>

            {/* Search */}
            <div className='relative w-full md:w-80'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <Input
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
        </div>

        {/* Grid View */}
        <GridCardView
          items={gridItems}
          emptyState={{
            icon: (
              <Briefcase className='text-muted-foreground mb-4 h-12 w-12' />
            ),
            title: searchTerm ? t('no_results') : t('no_positions'),
            description: searchTerm
              ? t('try_different_search')
              : t('no_positions_description')
          }}
        />
      </div>
    </PageContainer>
  );
}
