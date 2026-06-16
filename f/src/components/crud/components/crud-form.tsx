'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FieldConfig, FormState } from '../types';
import { memo } from 'react';

interface CrudFormProps {
  title: string;
  fields: FieldConfig[];
  formData: FormState;
  onFieldChange: (key: string, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isViewMode: boolean;
  loading: boolean;
  editingId: number | null;
  submitText: string;
  updateText: string;
  loadingText: string;
  closeText: string;
}

export const CrudForm = memo(function CrudForm({
  title,
  fields,
  formData,
  onFieldChange,
  onSubmit,
  onClose,
  isViewMode,
  loading,
  editingId,
  submitText,
  updateText,
  loadingText,
  closeText
}: CrudFormProps) {
  const renderField = (field: FieldConfig) => {
    const commonProps = {
      value: String(formData[field.key] || ''),
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => onFieldChange(field.key, e.target.value),
      disabled: loading || isViewMode,
      readOnly: isViewMode,
      placeholder: field.placeholder
    };

    switch (field.type) {
      case 'textarea':
        return <Textarea key={field.key} {...commonProps} />;
      case 'number':
        return <Input key={field.key} type='number' {...commonProps} />;
      case 'input':
      default:
        return <Input key={field.key} {...commonProps} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2 rounded-md border p-3'>
          {fields.map((field) => renderField(field))}

          <div className='flex gap-2'>
            {!isViewMode && (
              <Button onClick={onSubmit} disabled={loading}>
                {loading ? loadingText : editingId ? updateText : submitText}
              </Button>
            )}
            <Button variant='outline' onClick={onClose} disabled={loading}>
              {closeText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
