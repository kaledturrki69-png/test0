'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Position } from '@/types/position';
import { toast } from 'sonner';
import { PositionFormData } from './use-position-form';
import { logger } from '@/lib/logger';

interface UsePositionCRUDReturn {
  positions: Position[];
  loading: boolean;
  fetchPositions: () => Promise<void>;
  createPosition: (formData: PositionFormData) => Promise<boolean>;
  updatePosition: (id: number, formData: PositionFormData) => Promise<boolean>;
  deletePosition: (id: number) => Promise<boolean>;
}

export function usePositionCRUD(
  onSuccess?: (action: 'create' | 'update' | 'delete') => void,
  onError?: (action: 'create' | 'update' | 'delete', error: Error) => void
): UsePositionCRUDReturn {
  const { data: session } = useSession();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPositions = useCallback(async () => {
    if (!session?.accessToken) return;

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
      logger.error('Failed to load positions', error);
      if (onError) {
        onError('create', error as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, onError]);

  const createPosition = useCallback(
    async (formData: PositionFormData): Promise<boolean> => {
      if (!session?.accessToken) {
        toast.error('Please sign in to continue');
        return false;
      }

      try {
        setLoading(true);
        const payload = {
          category_id: formData.categoryId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          expected_hiring_date: formData.expectedHiringDate,
          number_to_hire: Number(formData.numberToHire),
          number_to_shortlist: Number(formData.numberToShortlist),
          status: formData.status,
          is_library: false,
          workplace: formData.workplace ? Number(formData.workplace) : 0,
          hard_skill_ids: formData.selectedHardSkills.map((id) => ({
            id: id,
            weight: formData.hardSkillWeights[id] || 0,
            additionalProp1: 'string',
            additionalProp2: 'string',
            additionalProp3: 'string'
          })),
          soft_skill_ids: formData.selectedSoftSkills.map((id) => ({
            id: id,
            weight: formData.softSkillWeights[id] || 0,
            additionalProp1: 'string',
            additionalProp2: 'string',
            additionalProp3: 'string'
          })),
          condition_ids: formData.selectedConditions
        };

        const response = await fetch('/api/positions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Failed to create position');
        }

        if (onSuccess) {
          onSuccess('create');
        }
        await fetchPositions();
        return true;
      } catch (error) {
        if (onError) {
          onError('create', error as Error);
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken, fetchPositions, onSuccess, onError]
  );

  const updatePosition = useCallback(
    async (id: number, formData: PositionFormData): Promise<boolean> => {
      if (!session?.accessToken) {
        toast.error('Please sign in to continue');
        return false;
      }

      try {
        setLoading(true);
        const payload = {
          category_id: formData.categoryId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          expected_hiring_date: formData.expectedHiringDate,
          number_to_hire: Number(formData.numberToHire),
          number_to_shortlist: Number(formData.numberToShortlist),
          status: formData.status,
          is_library: false,
          workplace: formData.workplace ? Number(formData.workplace) : 0,
          hard_skill_ids: formData.selectedHardSkills.map((skillId) => ({
            id: skillId,
            weight: formData.hardSkillWeights[skillId] || 0,
            additionalProp1: 'string',
            additionalProp2: 'string',
            additionalProp3: 'string'
          })),
          soft_skill_ids: formData.selectedSoftSkills.map((skillId) => ({
            id: skillId,
            weight: formData.softSkillWeights[skillId] || 0,
            additionalProp1: 'string',
            additionalProp2: 'string',
            additionalProp3: 'string'
          })),
          condition_ids: formData.selectedConditions
        };

        const response = await fetch(`/api/positions/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Failed to update position');
        }

        if (onSuccess) {
          onSuccess('update');
        }
        await fetchPositions();
        return true;
      } catch (error) {
        if (onError) {
          onError('update', error as Error);
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken, fetchPositions, onSuccess, onError]
  );

  const deletePosition = useCallback(
    async (id: number): Promise<boolean> => {
      if (!session?.accessToken) {
        toast.error('Please sign in to continue');
        return false;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/positions/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete position');
        }

        if (onSuccess) {
          onSuccess('delete');
        }
        await fetchPositions();
        return true;
      } catch (error) {
        if (onError) {
          onError('delete', error as Error);
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken, fetchPositions, onSuccess, onError]
  );

  return {
    positions,
    loading,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition
  };
}
