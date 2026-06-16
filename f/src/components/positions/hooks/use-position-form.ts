'use client';

import { useState, useCallback } from 'react';
import { Position } from '@/types/position';

export interface PositionFormData {
  name: string;
  description: string;
  expectedHiringDate: string;
  numberToHire: number | '';
  numberToShortlist: number | '';
  status: 'open' | 'closed';
  categoryId: number;
  workplace: number | '';
  selectedSoftSkills: number[];
  selectedHardSkills: number[];
  selectedConditions: number[];
  softSkillWeights: Record<number, number>;
  hardSkillWeights: Record<number, number>;
}

interface UsePositionFormReturn {
  formData: PositionFormData;
  setFormData: React.Dispatch<React.SetStateAction<PositionFormData>>;
  updateField: <K extends keyof PositionFormData>(
    field: K,
    value: PositionFormData[K]
  ) => void;
  addSoftSkill: (skillId: number) => void;
  removeSoftSkill: (skillId: number) => void;
  addHardSkill: (skillId: number) => void;
  removeHardSkill: (skillId: number) => void;
  addCondition: (conditionId: number) => void;
  removeCondition: (conditionId: number) => void;
  setSoftSkillWeight: (skillId: number, weight: number) => void;
  setHardSkillWeight: (skillId: number, weight: number) => void;
  resetForm: (defaultCategoryId?: number) => void;
  loadPosition: (position: Position) => void;
  validate: () => { isValid: boolean; errors: string[] };
}

const getInitialFormData = (
  defaultCategoryId: number = 1
): PositionFormData => ({
  name: '',
  description: '',
  expectedHiringDate: '',
  numberToHire: '',
  numberToShortlist: '',
  status: 'open',
  categoryId: defaultCategoryId,
  workplace: '',
  selectedSoftSkills: [],
  selectedHardSkills: [],
  selectedConditions: [],
  softSkillWeights: {},
  hardSkillWeights: {}
});

export function usePositionForm(
  defaultCategoryId: number = 1
): UsePositionFormReturn {
  const [formData, setFormData] = useState<PositionFormData>(
    getInitialFormData(defaultCategoryId)
  );

  const updateField = useCallback(
    <K extends keyof PositionFormData>(
      field: K,
      value: PositionFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const addSoftSkill = useCallback((skillId: number) => {
    setFormData((prev) => {
      if (prev.selectedSoftSkills.includes(skillId)) return prev;
      return {
        ...prev,
        selectedSoftSkills: [...prev.selectedSoftSkills, skillId]
      };
    });
  }, []);

  const removeSoftSkill = useCallback((skillId: number) => {
    setFormData((prev) => {
      const newWeights = { ...prev.softSkillWeights };
      delete newWeights[skillId];
      return {
        ...prev,
        selectedSoftSkills: prev.selectedSoftSkills.filter(
          (id) => id !== skillId
        ),
        softSkillWeights: newWeights
      };
    });
  }, []);

  const addHardSkill = useCallback((skillId: number) => {
    setFormData((prev) => {
      if (prev.selectedHardSkills.includes(skillId)) return prev;
      return {
        ...prev,
        selectedHardSkills: [...prev.selectedHardSkills, skillId]
      };
    });
  }, []);

  const removeHardSkill = useCallback((skillId: number) => {
    setFormData((prev) => {
      const newWeights = { ...prev.hardSkillWeights };
      delete newWeights[skillId];
      return {
        ...prev,
        selectedHardSkills: prev.selectedHardSkills.filter(
          (id) => id !== skillId
        ),
        hardSkillWeights: newWeights
      };
    });
  }, []);

  const addCondition = useCallback((conditionId: number) => {
    setFormData((prev) => {
      if (prev.selectedConditions.includes(conditionId)) return prev;
      return {
        ...prev,
        selectedConditions: [...prev.selectedConditions, conditionId]
      };
    });
  }, []);

  const removeCondition = useCallback((conditionId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedConditions: prev.selectedConditions.filter(
        (id) => id !== conditionId
      )
    }));
  }, []);

  const setSoftSkillWeight = useCallback((skillId: number, weight: number) => {
    setFormData((prev) => ({
      ...prev,
      softSkillWeights: { ...prev.softSkillWeights, [skillId]: weight }
    }));
  }, []);

  const setHardSkillWeight = useCallback((skillId: number, weight: number) => {
    setFormData((prev) => ({
      ...prev,
      hardSkillWeights: { ...prev.hardSkillWeights, [skillId]: weight }
    }));
  }, []);

  const resetForm = useCallback(
    (defaultCatId?: number) => {
      setFormData(getInitialFormData(defaultCatId || defaultCategoryId));
    },
    [defaultCategoryId]
  );

  const loadPosition = useCallback(
    (position: Position) => {
      // Map skill weights
      const softWeights: Record<number, number> = {};
      const hardWeights: Record<number, number> = {};
      position.soft_skills.forEach((s) => {
        softWeights[s.id] = s.weight;
      });
      position.hard_skills.forEach((s) => {
        hardWeights[s.id] = s.weight;
      });

      setFormData({
        name: position.name,
        description: position.description,
        expectedHiringDate: position.expected_hiring_date,
        numberToHire: position.number_to_hire,
        numberToShortlist: position.number_to_shortlist,
        status: position.status,
        categoryId: position.category?.id || defaultCategoryId,
        workplace: position.workplace || '',
        selectedSoftSkills: position.soft_skills.map((s) => s.id),
        selectedHardSkills: position.hard_skills.map((s) => s.id),
        selectedConditions: position.conditions.map((c) => c.id),
        softSkillWeights: softWeights,
        hardSkillWeights: hardWeights
      });
    },
    [defaultCategoryId]
  );

  const validate = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Position name is required');
    }
    if (!formData.description.trim()) {
      errors.push('Description is required');
    }
    if (!formData.expectedHiringDate) {
      errors.push('Expected hiring date is required');
    }
    if (!formData.numberToHire) {
      errors.push('Number to hire is required');
    }
    if (!formData.numberToShortlist) {
      errors.push('Number to shortlist is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData]);

  return {
    formData,
    setFormData,
    updateField,
    addSoftSkill,
    removeSoftSkill,
    addHardSkill,
    removeHardSkill,
    addCondition,
    removeCondition,
    setSoftSkillWeight,
    setHardSkillWeight,
    resetForm,
    loadPosition,
    validate
  };
}
