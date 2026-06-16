'use client';

import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ChevronDown } from 'lucide-react';
import { Skill } from '@/types/skill';
import { QuizCategory } from '@/types/quiz';
import { QuizFormData } from '@/components/quizzes/hooks/quiz/use-quiz-form';
import { useTranslations } from 'next-intl';

interface QuizFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: QuizFormData;
  onFormDataChange: Dispatch<SetStateAction<QuizFormData>>;
  hardSkills: Skill[];
  softSkills: Skill[];
  categories: QuizCategory[];
  onSubmit: () => void;
  onCancel: () => void;
  isEdit: boolean;
  loading: boolean;
}

export function QuizFormDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  hardSkills,
  softSkills,
  onSubmit,
  onCancel,
  isEdit,
  loading
}: QuizFormDialogProps) {
  const t = useTranslations('quiz_components');
  const LANGUAGES = [
    { value: 'en', label: t('english') },
    { value: 'fr', label: t('french') },
    { value: 'ar', label: t('arabic') }
  ];

  const updateField = (field: keyof QuizFormData, value: any) => {
    onFormDataChange((prev) => {
      const updates: Partial<QuizFormData> = { [field]: value };

      if (field === 'skillType' && value !== prev.skillType) {
        updates.skill = 0;
      }

      if (field === 'objectif' && value !== 'skill') {
        updates.skillType = '' as any;
        updates.skill = 0;
      }

      return { ...prev, ...updates } as QuizFormData;
    });
  };

  const prefix = isEdit ? 'edit-' : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('edit_template') : t('create_template')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('update_template_description')
              : t('create_template_description')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor={`${prefix}name`}>{t('template_name')}</Label>
            <Input
              id={`${prefix}name`}
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={t('template_name_placeholder')}
            />
          </div>

          {/* Objectif */}
          <div className='space-y-2'>
            <Label htmlFor={`${prefix}objectif`}>{t('objectif')}</Label>
            <Select
              value={formData.objectif}
              onValueChange={(value) =>
                updateField(
                  'objectif',
                  value as 'skill' | 'interview' | 'satisfaction' | 'other'
                )
              }
            >
              <SelectTrigger id={`${prefix}objectif`}>
                <SelectValue placeholder={t('select_objectif')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='skill'>{t('objectif_skill')}</SelectItem>
                <SelectItem value='interview'>
                  {t('objectif_interview')}
                </SelectItem>
                <SelectItem value='satisfaction'>
                  {t('objectif_satisfaction')}
                </SelectItem>
                <SelectItem value='other'>{t('objectif_other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Version input removed; defaults handled in submit */}

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor={`${prefix}skillType`}>{t('skill_type')}</Label>
              <Select
                disabled={formData.objectif !== 'skill'}
                value={formData.skillType}
                onValueChange={(value) => {
                  updateField(
                    'skillType',
                    value === 'hard' || value === 'soft' ? value : ''
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('select_skill_type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='hard'>{t('hard_skills')}</SelectItem>
                  <SelectItem value='soft'>{t('soft_skills')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.skillType ? (
              <div className='space-y-2'>
                <Label htmlFor={`${prefix}skill`}>{t('skill')}</Label>
                <Select
                  disabled={formData.objectif !== 'skill'}
                  key={`${prefix}skill-select-${formData.skillType}`}
                  value={
                    formData.skill > 0 ? formData.skill.toString() : undefined
                  }
                  onValueChange={(value) =>
                    updateField('skill', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('select_skill_placeholder', {
                        type: formData.skillType
                      })}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.skillType === 'hard' ? hardSkills : softSkills)
                      .length === 0 ? (
                      <div className='text-muted-foreground px-2 py-1.5 text-sm'>
                        {t('no_skills_available', { type: formData.skillType })}
                      </div>
                    ) : (
                      (formData.skillType === 'hard'
                        ? hardSkills
                        : softSkills
                      ).map((skill) => (
                        <SelectItem key={skill.id} value={skill.id.toString()}>
                          {skill.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className='space-y-2'>
                <Label htmlFor={`${prefix}skill`}>{t('skill')}</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_skill_type_first')} />
                  </SelectTrigger>
                </Select>
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor={`${prefix}description`}>{t('description')}</Label>
            <Textarea
              id={`${prefix}description`}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder={t('description_placeholder')}
              rows={3}
            />
          </div>

          {/* Default Question Count removed; defaults handled in submit */}

          {/* Language Mode */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>{t('language_mode')}</Label>
              <Select
                value={formData.languageMode}
                onValueChange={(value) =>
                  updateField(
                    'languageMode',
                    value === 'single' || value === 'multi' ? value : 'single'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('select_language_mode')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='single'>{t('single_language')}</SelectItem>
                  <SelectItem value='multi'>{t('multi_language')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>
                {formData.languageMode === 'single'
                  ? t('language')
                  : t('languages')}
              </Label>
              {formData.languageMode === 'single' ? (
                <Select
                  value={formData.languages?.[0] || 'en'}
                  onValueChange={(value) => updateField('languages', [value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_language')} />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' className='justify-between'>
                      {formData.languages?.length
                        ? t('selected_count', {
                            count: formData.languages.length
                          })
                        : t('select_languages')}
                      <ChevronDown className='ml-2 h-4 w-4 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-64 p-2'>
                    <div className='space-y-2'>
                      {LANGUAGES.map((lang) => {
                        const selected = (formData.languages || []).includes(
                          lang.value
                        );
                        return (
                          <div
                            key={lang.value}
                            className='hover:bg-accent flex cursor-pointer items-center space-x-2 rounded-md p-2'
                            onClick={() => {
                              const current = formData.languages || [];
                              const next = selected
                                ? current.filter((v) => v !== lang.value)
                                : [...current, lang.value];
                              updateField('languages', next);
                            }}
                          >
                            <Checkbox
                              checked={selected}
                              onCheckedChange={() => {}}
                            />
                            <span>{lang.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {/* Categories selection removed from create template */}
        </div>

        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {isEdit ? t('updating') : t('creating')}
              </>
            ) : isEdit ? (
              t('update_template')
            ) : (
              t('create_template_button')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
