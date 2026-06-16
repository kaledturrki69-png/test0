'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { IconEdit, IconX } from '@tabler/icons-react';
import { QuizTemplate, QuizCategory } from '@/types/quiz';
import { useTranslations } from 'next-intl';

interface CategoryFormData {
  template: number;
  name: string;
  description: string;
  weight: number;
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onUpdate?: (id: number, data: CategoryFormData) => Promise<void>;
  loading: boolean;
  updating?: boolean;
  templates: QuizTemplate[];
  categories?: QuizCategory[];
  selectedQuizId?: number | null;
}

const getInitialFormData = (): CategoryFormData => ({
  template: 0,
  name: '',
  description: '',
  weight: 0.1
});

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  onUpdate,
  loading,
  updating = false,
  templates,
  categories = [],
  selectedQuizId = null
}: CategoryFormDialogProps) {
  const t = useTranslations('category_form');
  const [formData, setFormData] =
    useState<CategoryFormData>(getInitialFormData());
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );

  // Filter templates to only show selected quiz
  const filteredTemplates = selectedQuizId
    ? templates.filter((tmpl) => tmpl.id === selectedQuizId)
    : templates;

  // Get the selected template for display
  const selectedTemplate = selectedQuizId
    ? templates.find((tmpl) => tmpl.id === selectedQuizId)
    : null;
  // Always include "Default" category regardless of template
  const filteredCategories = selectedQuizId
    ? categories.filter(
        (c) =>
          c.template === selectedQuizId || c.name.toLowerCase() === 'default'
      )
    : categories;

  // Auto-select the template if selectedQuizId is provided
  useEffect(() => {
    if (selectedQuizId && selectedQuizId > 0 && !editingCategoryId) {
      setFormData((prev) => {
        // Only update if template is not already set or is 0
        if (!prev.template || prev.template === 0) {
          return {
            ...prev,
            template: selectedQuizId
          };
        }
        return prev;
      });
    }
  }, [selectedQuizId, editingCategoryId]);

  // Also ensure template is set when dialog opens with selectedQuizId
  useEffect(() => {
    if (open && selectedQuizId && selectedQuizId > 0 && !editingCategoryId) {
      setFormData((prev) => ({
        ...prev,
        template: selectedQuizId
      }));
    }
  }, [open, selectedQuizId, editingCategoryId]);

  useEffect(() => {
    if (!open) {
      setFormData(getInitialFormData());
      setEditingCategoryId(null);
    }
  }, [open]);

  const updateField = (field: keyof CategoryFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use selectedQuizId if formData.template is not set
    const templateId =
      formData.template && formData.template > 0
        ? formData.template
        : selectedQuizId && selectedQuizId > 0
          ? selectedQuizId
          : 0;

    if (!formData.name.trim() || !templateId || templateId === 0) {
      return;
    }

    // Create form data with the resolved template ID
    const submitData = {
      ...formData,
      template: templateId
    };

    if (editingCategoryId && onUpdate) {
      await onUpdate(editingCategoryId, submitData);
      setEditingCategoryId(null);
    } else {
      await onSubmit(submitData);
    }
    setFormData(getInitialFormData());
  };

  const handleCancel = () => {
    setFormData(getInitialFormData());
    setEditingCategoryId(null);
    onOpenChange(false);
  };

  const handleEditCategory = (category: QuizCategory) => {
    setEditingCategoryId(category.id);
    setFormData({
      template: category.template || formData.template || 0,
      name: category.name,
      description: category.description || '',
      weight: category.weight || 0.1
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {editingCategoryId ? t('edit_category') : t('create_category')}
          </DialogTitle>
          <DialogDescription>
            {editingCategoryId
              ? t('update_category_description')
              : t('create_category_description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='category-template'>{t('template')}</Label>
              {selectedQuizId ? (
                <div className='bg-muted flex h-10 items-center rounded-md border px-3 text-sm'>
                  {selectedTemplate?.name || t('unknown_quiz')}{' '}
                  {selectedTemplate?.version && `(${selectedTemplate.version})`}
                </div>
              ) : (
                <>
                  <div className='flex items-center gap-2'>
                    <Select
                      value={
                        formData.template && formData.template > 0
                          ? formData.template.toString()
                          : ''
                      }
                      onValueChange={(value) =>
                        updateField('template', parseInt(value, 10))
                      }
                      required
                      disabled={!!editingCategoryId}
                    >
                      <SelectTrigger id='category-template' className='flex-1'>
                        <SelectValue placeholder={t('select_template')} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTemplates.length === 0 ? (
                          <SelectItem value='' disabled>
                            {t('no_templates_available')}
                          </SelectItem>
                        ) : (
                          filteredTemplates.map((template) => (
                            <SelectItem
                              key={template.id}
                              value={template.id.toString()}
                            >
                              {template.name}{' '}
                              {template.version ? `(${template.version})` : ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {editingCategoryId && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='h-9 w-9 flex-shrink-0 p-0'
                        onClick={() => {
                          setEditingCategoryId(null);
                          setFormData(getInitialFormData());
                        }}
                        title={t('exit_edit_mode')}
                      >
                        <IconX className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                  {editingCategoryId &&
                    formData.template &&
                    formData.template > 0 && (
                      <p className='text-muted-foreground text-xs'>
                        {t('template_colon')}{' '}
                        {filteredTemplates.find(
                          (tmpl) => tmpl.id === formData.template
                        )?.name || `#${formData.template}`}
                        {filteredTemplates.find(
                          (tmpl) => tmpl.id === formData.template
                        )?.version &&
                          ` (${filteredTemplates.find((tmpl) => tmpl.id === formData.template)?.version})`}
                      </p>
                    )}
                </>
              )}
            </div>

            {filteredCategories.length > 0 && (
              <div className='space-y-2'>
                <Label>{t('existing_categories')}</Label>
                <div className='border-input bg-background max-h-48 overflow-y-auto rounded-md border p-2'>
                  {filteredCategories.map((category) => {
                    const isDefaultCategory =
                      category.name.toLowerCase() === 'default';
                    return (
                      <div
                        key={category.id}
                        className='hover:bg-accent flex items-center justify-between rounded-md px-3 py-2 transition-colors'
                      >
                        <span className='flex-1 text-sm'>
                          {category.name}
                          {category.template && (
                            <span className='text-muted-foreground ml-2'>
                              ({t('template_colon')} {category.template})
                            </span>
                          )}
                        </span>
                        {!isDefaultCategory && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                            onClick={() => handleEditCategory(category)}
                            disabled={!!editingCategoryId}
                          >
                            <IconEdit className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='category-name'>{t('name')}</Label>
              <Input
                id='category-name'
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder={t('name_placeholder')}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category-description'>{t('description')}</Label>
              <Textarea
                id='category-description'
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder={t('description_placeholder')}
                rows={3}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category-weight'>{t('weight')}</Label>
              <Input
                id='category-weight'
                type='number'
                step='0.1'
                min='0'
                max='1'
                value={formData.weight}
                onChange={(e) =>
                  updateField('weight', parseFloat(e.target.value) || 0.1)
                }
                placeholder={t('weight_placeholder')}
              />
              <p className='text-muted-foreground text-sm'>
                {t('weight_description')}
              </p>
            </div>
          </div>

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={handleCancel}>
              {t('cancel')}
            </Button>
            <Button
              type='submit'
              disabled={
                loading ||
                updating ||
                !formData.name.trim() ||
                ((!formData.template || formData.template === 0) &&
                  (!selectedQuizId ||
                    selectedQuizId === 0 ||
                    selectedQuizId === null))
              }
            >
              {loading || updating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {editingCategoryId ? t('updating') : t('creating')}
                </>
              ) : editingCategoryId ? (
                t('update_category')
              ) : (
                t('create_category_button')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
