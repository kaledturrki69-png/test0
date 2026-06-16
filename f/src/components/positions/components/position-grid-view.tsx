'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Position } from '@/types/position';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconRoute,
  IconLayoutGrid
} from '@tabler/icons-react';
import { WorkflowService } from '@/services/workflow-service';

interface PositionGridViewProps {
  positions: Position[];
  onEdit: (position: Position) => void;
  onDelete: (positionId: number, positionName: string) => void;
  loading?: boolean;
}

export function PositionGridView({
  positions,
  onEdit,
  onDelete,
  loading = false
}: PositionGridViewProps) {
  const t = useTranslations('jobfile');
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const locale = pathname.split('/')[1] || 'en';
  const [workflowConfigs, setWorkflowConfigs] = useState<
    Map<number, { id: number; enabled: boolean }>
  >(new Map());
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [workplaces, setWorkplaces] = useState<
    Map<number, { name: string; address_line1?: string }>
  >(new Map());

  // Load workplaces to enrich position data
  useEffect(() => {
    const loadWorkplaces = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await fetch('/api/accounts/workplaces', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const workplacesMap = new Map<
            number,
            { name: string; address_line1?: string }
          >();
          if (Array.isArray(data)) {
            data.forEach((wp: any) => {
              workplacesMap.set(wp.id, {
                name: wp.name || '',
                address_line1: wp.address_line1
              });
            });
          }
          setWorkplaces(workplacesMap);
        }
      } catch (error) {
        // Silently fail - workplaces are optional
      }
    };

    loadWorkplaces();
  }, [session?.accessToken]);

  // Load workflow configs for all positions
  useEffect(() => {
    const loadConfigs = async () => {
      if (!session?.accessToken) {
        setLoadingConfigs(false);
        return;
      }

      try {
        const configs = await WorkflowService.getConfigs(session.accessToken);
        const configMap = new Map<number, { id: number; enabled: boolean }>();

        configs.forEach((config) => {
          try {
            const data = JSON.parse(config.data);
            const enabled = data.enabled !== false; // Default to true if not set
            configMap.set(config.position, {
              id: config.id || 0,
              enabled
            });
          } catch {
            configMap.set(config.position, {
              id: config.id || 0,
              enabled: true
            });
          }
        });

        setWorkflowConfigs(configMap);
      } catch (error) {
        //console.error('Failed to load workflow configs:', error);
      } finally {
        setLoadingConfigs(false);
      }
    };

    loadConfigs();
  }, [session?.accessToken]);

  const handleWorkflowSetup = (positionId: number) => {
    router.push(`/${locale}/dashboard/workflows/designer/${positionId}`);
  };

  const handleWorkflowToggle = async (positionId: number) => {
    if (!session?.accessToken) {
      toast.error('Please sign in to toggle workflow');
      return;
    }

    const config = workflowConfigs.get(positionId);

    // Check if config exists
    if (!config) {
      toast.error('Setup the workflow first');
      return;
    }

    try {
      const configs = await WorkflowService.getConfigs(
        session.accessToken,
        positionId
      );
      if (configs.length === 0) {
        toast.error('Setup the workflow first');
        return;
      }

      const existingConfig = configs[0];
      const workflowData = JSON.parse(existingConfig.data);
      const newEnabled = !workflowData.enabled;
      workflowData.enabled = newEnabled;

      await WorkflowService.updateConfig(
        session.accessToken,
        existingConfig.id!,
        {
          position: positionId,
          data: JSON.stringify(workflowData)
        }
      );

      setWorkflowConfigs((prev) => {
        const newMap = new Map(prev);
        newMap.set(positionId, {
          id: existingConfig.id!,
          enabled: newEnabled
        });
        return newMap;
      });

      toast.success(
        `Workflow ${newEnabled ? 'enabled' : 'disabled'} successfully`
      );
    } catch (error) {
      toast.error('Failed to toggle workflow');
      //console.error('Error toggling workflow:', error);
    }
  };

  if (positions.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <div className='text-muted-foreground text-center'>
            <IconPlus className='mx-auto mb-4 h-12 w-12 opacity-50' />
            <p className='mb-2 text-lg font-medium'>{t('none')}</p>
            <p className='text-sm'>{t('create_first')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleMatrice = (positionId: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedPositionId', String(positionId));
    }
    router.push(`/${locale}/dashboard/matrice`);
  };

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {positions.map((position) => {
        return (
          <Card key={position.id} className='transition-shadow hover:shadow-md'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>{position.name}</CardTitle>
                  <Badge
                    variant={
                      position.status === 'open' ? 'default' : 'secondary'
                    }
                    className='mt-1'
                  >
                    {position.status === 'open' ? 'Open' : 'Closed'}
                  </Badge>
                </div>
                <div className='flex gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onEdit(position)}
                    disabled={loading}
                  >
                    <IconEdit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onDelete(position.id, position.name)}
                    disabled={loading}
                  >
                    <IconTrash className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='text-muted-foreground text-sm'>
                {/* <p>
                  <strong>id:</strong> {position.id}
                </p> */}
                <p>
                  <strong>{t('category')}:</strong>{' '}
                  {position.category?.name || t('no_category')}
                </p>
                <p>
                  <strong>{t('expected_date')}:</strong>{' '}
                  {position.expected_hiring_date}
                </p>
                <p>
                  <strong>{t('positions')}:</strong> {position.number_to_hire}
                </p>
                <p>
                  <strong>{t('shortlist')}:</strong>{' '}
                  {position.number_to_shortlist}
                </p>
                <p>
                  <strong>{t('workplace')}:</strong>{' '}
                  {position.workplace_name
                    ? (() => {
                        const workplace = workplaces.get(position.workplace);
                        const address = workplace?.address_line1;
                        return address
                          ? `${position.workplace_name} (${address})`
                          : position.workplace_name;
                      })()
                    : t('no_workplace') || 'None'}
                </p>
              </div>
              <div className='text-sm'>
                <div
                  className='prose prose-sm line-clamp-2 max-w-none'
                  dangerouslySetInnerHTML={{
                    __html: position.description
                  }}
                />
              </div>
              <div className='flex flex-wrap gap-1'>
                <span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                  {position.soft_skills.length} {t('soft_skills')}
                </span>
                <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-800'>
                  {position.hard_skills.length} {t('hard_skills')}
                </span>
                <span className='rounded bg-purple-100 px-2 py-1 text-xs text-purple-800'>
                  {position.conditions.length} {t('conditions')}
                </span>
              </div>
              <div className='flex items-center justify-between border-t pt-3'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <Label
                      htmlFor={`workflow-${position.id}`}
                      className='text-sm'
                    >
                      Workflow
                    </Label>
                    <Switch
                      id={`workflow-${position.id}`}
                      checked={
                        workflowConfigs.get(position.id)?.enabled ?? false
                      }
                      onCheckedChange={() => handleWorkflowToggle(position.id)}
                      disabled={
                        loadingConfigs || !workflowConfigs.has(position.id)
                      }
                    />
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleWorkflowSetup(position.id)}
                    disabled={loading || loadingConfigs}
                    className='gap-2'
                  >
                    <IconRoute className='h-4 w-4' />
                    <span>Config</span>
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleMatrice(position.id)}
                    disabled={loading || loadingConfigs}
                    className='gap-2'
                  >
                    <IconLayoutGrid className='h-4 w-4' />
                    <span>Matrice</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
