'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Skill } from '@/types/skill';
import { Condition } from '@/types/condition';
import { Category } from '@/types/category';
import { logger } from '@/lib/logger';

interface Workplace {
  id: number;
  name: string;
  type?: string;
}

interface ReferenceData {
  softSkills: Skill[];
  hardSkills: Skill[];
  conditions: Condition[];
  categories: Category[];
  workplaces: Workplace[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useReferenceData(): ReferenceData {
  const { data: session } = useSession();
  const [softSkills, setSoftSkills] = useState<Skill[]>([]);
  const [hardSkills, setHardSkills] = useState<Skill[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReferenceData = useCallback(async () => {
    if (!session?.accessToken) return;

    setIsLoading(true);

    try {
      const [skillsRes, conditionsRes, categoriesRes, workplacesRes] =
        await Promise.all([
          fetch('/api/skills', {
            headers: { Authorization: `Bearer ${session.accessToken}` }
          }),
          fetch('/api/conditions', {
            headers: { Authorization: `Bearer ${session.accessToken}` }
          }),
          fetch('/api/categories', {
            headers: { Authorization: `Bearer ${session.accessToken}` }
          }),
          fetch('/api/accounts/workplaces', {
            headers: { Authorization: `Bearer ${session.accessToken}` }
          })
        ]);

      // Process skills
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        const allSkills = Array.isArray(skillsData) ? skillsData : [];
        setSoftSkills(allSkills.filter((s: Skill) => s.type === 'soft'));
        setHardSkills(allSkills.filter((s: Skill) => s.type === 'hard'));
      }

      // Process conditions
      if (conditionsRes.ok) {
        const conditionsData = await conditionsRes.json();
        if (Array.isArray(conditionsData)) {
          setConditions(conditionsData);
        } else if (
          conditionsData.conditions &&
          Array.isArray(conditionsData.conditions)
        ) {
          setConditions(conditionsData.conditions);
        }
      }

      // Process categories
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }

      // Process workplaces
      if (workplacesRes.ok) {
        const workplacesData = await workplacesRes.json();
        setWorkplaces(Array.isArray(workplacesData) ? workplacesData : []);
      }
    } catch (error) {
      logger.error('Failed to fetch reference data', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  return {
    softSkills,
    hardSkills,
    conditions,
    categories,
    workplaces,
    isLoading,
    refetch: fetchReferenceData
  };
}
