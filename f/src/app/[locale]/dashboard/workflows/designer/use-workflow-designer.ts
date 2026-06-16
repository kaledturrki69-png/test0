'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useWorkflowDesigner(positionId?: number) {
  const { data: session } = useSession();
  const t = useTranslations('workflows.designer');
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchPositionWithValidations = useCallback(async () => {
    if (!session?.accessToken || !positionId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/positions/${positionId}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        },
        cache: 'no-store'
      });

      if (!res.ok) throw new Error('Failed to fetch position data');
      const data = await res.json();
      setPosition(data);
    } catch (err) {
      toast.error(t('unable_to_load_position'));
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, positionId, t]);

  const saveWorkflowDraft = useCallback(
    async (nodes: any[]) => {
      if (!session?.accessToken) {
        toast.error(t('sign_in_required'));
        return;
      }

      const body = {
        position: positionId,
        name: `${position?.name || t('draft_name')}`,
        scope: 'position',
        steps: nodes.map((n) => ({
          skill_id: n.id,
          skill_name: n.data.label,
          category: n.data.category,
          quiz_id: n.data.quizId,
          weight: n.data.weight,
          mandatory: n.data.mandatory
        }))
      };

      const res = await fetch(`/api/workflow/assessment-sequences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) toast.success(t('draft_saved'));
      else toast.error(t('draft_save_failed'));
    },
    [session?.accessToken, positionId, position, t]
  );

  return {
    position,
    loading,
    fetchPositionWithValidations,
    saveWorkflowDraft
  };
}
