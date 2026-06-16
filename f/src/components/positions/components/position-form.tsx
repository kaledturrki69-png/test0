'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Position, Library } from '@/types/position';
import { Undo2, Edit as EditIcon } from 'lucide-react';
import { PositionBasicFields } from './position-basic-fields';
import { SkillSelector } from './skill-selector';
import { ConditionSelector } from './condition-selector';
import { usePositionForm, PositionFormData } from '../hooks/use-position-form';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface PositionFormProps {
  mode: 'create' | 'edit' | 'view';
  position?: Position;
  selectedLibrary?: Library | null;
  referenceData: {
    softSkills: any[];
    hardSkills: any[];
    conditions: any[];
    categories: any[];
    workplaces: any[];
  };
  loading?: boolean;
  onClose: () => void;
  onSubmit: (formData: PositionFormData) => Promise<boolean>;
  onSwitchToEdit?: () => void;
}

export function PositionForm({
  mode,
  position,
  selectedLibrary,
  referenceData,
  loading = false,
  onClose,
  onSubmit,
  onSwitchToEdit
}: PositionFormProps) {
  const t = useTranslations('jobfile');
  const defaultCategoryId =
    referenceData.categories.length > 0 ? referenceData.categories[0].id : 1;

  const form = usePositionForm(defaultCategoryId);

  // Load position data when editing/viewing
  useEffect(() => {
    if (position && (mode === 'edit' || mode === 'view')) {
      form.loadPosition(position);
    }
  }, [position, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    const validation = form.validate();
    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    const success = await onSubmit(form.formData);
    if (success) {
      toast.success(mode === 'create' ? t('created') : t('updated'));
      onClose();
    } else {
      toast.error(mode === 'create' ? t('failed_save') : t('failed_save'));
    }
  };

  const isViewMode = mode === 'view';

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>
            {isViewMode ? t('view') : mode === 'edit' ? t('edit') : t('create')}
          </CardTitle>
          <div className='flex items-center gap-2'>
            {isViewMode && onSwitchToEdit && (
              <Button
                variant='outline'
                onClick={onSwitchToEdit}
                disabled={loading}
              >
                <EditIcon className='h-4 w-4' />
              </Button>
            )}
            <Button variant='outline' onClick={onClose} disabled={loading}>
              <Undo2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Library Info */}
        {selectedLibrary && (
          <div className='bg-muted rounded-md border p-3'>
            <div className='mb-1 text-sm font-medium'>
              {t('selected_library')}
            </div>
            <div className='text-muted-foreground text-sm'>
              {selectedLibrary.name} - {selectedLibrary.category.name}
            </div>
          </div>
        )}

        {/* Basic Fields */}
        <PositionBasicFields
          name={form.formData.name}
          description={form.formData.description}
          expectedHiringDate={form.formData.expectedHiringDate}
          numberToHire={form.formData.numberToHire}
          numberToShortlist={form.formData.numberToShortlist}
          status={form.formData.status}
          categoryId={form.formData.categoryId}
          workplace={form.formData.workplace}
          categories={referenceData.categories}
          workplaces={referenceData.workplaces}
          onNameChange={(value) => form.updateField('name', value)}
          onDescriptionChange={(value) =>
            form.updateField('description', value)
          }
          onExpectedHiringDateChange={(value) =>
            form.updateField('expectedHiringDate', value)
          }
          onNumberToHireChange={(value) =>
            form.updateField('numberToHire', value)
          }
          onNumberToShortlistChange={(value) =>
            form.updateField('numberToShortlist', value)
          }
          onStatusChange={(value) => form.updateField('status', value)}
          onCategoryChange={(value) => form.updateField('categoryId', value)}
          onWorkplaceChange={(value) => form.updateField('workplace', value)}
          isViewMode={isViewMode}
          loading={loading}
        />

        {/* Soft Skills */}
        <SkillSelector
          title={t('soft_skills')}
          type='soft'
          availableSkills={referenceData.softSkills}
          selectedSkillIds={form.formData.selectedSoftSkills}
          skillWeights={form.formData.softSkillWeights}
          onAdd={form.addSoftSkill}
          onRemove={form.removeSoftSkill}
          onWeightChange={form.setSoftSkillWeight}
          isViewMode={isViewMode}
          loading={loading}
          selectPlaceholder={t('select_soft')}
        />

        {/* Hard Skills */}
        <SkillSelector
          title={t('hard_skills')}
          type='hard'
          availableSkills={referenceData.hardSkills}
          selectedSkillIds={form.formData.selectedHardSkills}
          skillWeights={form.formData.hardSkillWeights}
          onAdd={form.addHardSkill}
          onRemove={form.removeHardSkill}
          onWeightChange={form.setHardSkillWeight}
          isViewMode={isViewMode}
          loading={loading}
          selectPlaceholder={t('select_hard')}
        />

        {/* Conditions */}
        <ConditionSelector
          title={t('conditions')}
          availableConditions={referenceData.conditions}
          selectedConditionIds={form.formData.selectedConditions}
          onAdd={form.addCondition}
          onRemove={form.removeCondition}
          isViewMode={isViewMode}
          loading={loading}
          selectPlaceholder={t('select_condition')}
        />

        {/* Submit Button */}
        {!isViewMode && (
          <div className='pt-2'>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading
                ? t('loading')
                : mode === 'edit'
                  ? t('update_position')
                  : t('save_position')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
