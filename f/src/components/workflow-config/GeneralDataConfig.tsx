'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useWorkflowConfig } from './use-workflow-config';
import { useTranslations } from 'next-intl';

const MANDATORY_FIELDS = [
  'name',
  'email',
  'phone',
  'title',
  'summary',
  'location',
  'education',
  'experience',
  'languages'
];

const OPTIONAL_FIELDS = [
  { key: 'linkedin', label: 'LinkedIn Profile' },
  { key: 'mobility', label: 'Mobility' },
  { key: 'driving_license', label: 'Driving License (Permis de conduire)' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'hobbies', label: 'Hobbies / Interests' },
  { key: 'marital_status', label: 'Marital Status' },
  { key: 'nationality', label: 'Nationality' },
  { key: 'desired_salary', label: 'Desired Salary' },
  { key: 'availability_date', label: 'Availability Date' }
];

export function GeneralDataConfig({
  node,
  onConfigChange
}: {
  node: any;
  onConfigChange?: (config: any) => void;
}) {
  const t = useTranslations('workflow_config');
  const { saveConfig, getConfig } = useWorkflowConfig(node, onConfigChange);
  const [optionalFields, setOptionalFields] = useState<string[]>(
    getConfig('optionalFields', [])
  );

  // Sync state when node changes
  useEffect(() => {
    const config = node?.data?.config || {};
    setOptionalFields(config.optionalFields || []);
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-generate caption
  useEffect(() => {
    const caption =
      optionalFields.length > 0
        ? t('general.caption_optional', {
            fields: optionalFields
              .map((field) =>
                t(`general.optional_fields.${field}` as const, {
                  defaultValue: field
                })
              )
              .join(', ')
          })
        : t('general.caption_mandatory');
    saveConfig({ caption });
  }, [optionalFields, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOptionalField = (key: string) => {
    setOptionalFields((prev) => {
      const exists = prev.includes(key);
      const updated = exists ? prev.filter((f) => f !== key) : [...prev, key];
      saveConfig({ optionalFields: updated });
      return updated;
    });
  };

  return (
    <Card className='bg-muted/30'>
      <CardHeader>
        <CardTitle>{t('general.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label className='text-muted-foreground text-sm uppercase'>
            {t('general.mandatory_title')}
          </Label>
          <div className='mt-2 space-y-1'>
            {MANDATORY_FIELDS.map((field) => (
              <div key={field} className='flex items-center space-x-2'>
                <Checkbox checked disabled id={field} />
                <Label htmlFor={field} className='text-sm capitalize'>
                  {t(`general.mandatory_fields.${field}` as const, {
                    defaultValue: field.replaceAll('_', ' ')
                  })}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className='my-3' />

        <div>
          <Label className='text-muted-foreground text-sm uppercase'>
            {t('general.additional_title')}
          </Label>
          <div className='mt-2 space-y-1'>
            {OPTIONAL_FIELDS.map((item) => (
              <div key={item.key} className='flex items-center space-x-2'>
                <Checkbox
                  id={item.key}
                  checked={optionalFields.includes(item.key)}
                  onCheckedChange={() => toggleOptionalField(item.key)}
                />
                <Label htmlFor={item.key} className='text-sm'>
                  {t(`general.optional_fields.${item.key}` as const, {
                    defaultValue: item.label
                  })}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
