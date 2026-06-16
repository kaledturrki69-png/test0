'use client';

import { GenericCrudPage } from '@/components/crud';
import { Skill } from '@/types/skill';
import { usePageTitle } from '@/hooks/use-page-title';
import { useTranslations } from 'next-intl';

export default function SoftSkillsPage() {
  usePageTitle('Soft Skills');
  const t = useTranslations('SoftSkillsPage');

  return (
    <GenericCrudPage<Skill>
      config={{
        title: t('title'),
        subtitle: t('subtitle'),
        translations: 'SoftSkillsPage',
        apiEndpoint: '/api/skills',
        additionalParams: { type: 'soft' },
        additionalPayloadFields: { type: 'soft' },
        fields: [
          {
            key: 'name',
            type: 'input',
            placeholder: t('name'),
            required: true
          },
          {
            key: 'description',
            type: 'textarea',
            placeholder: t('description'),
            required: true
          }
        ],
        tableColumns: [
          {
            key: 'name',
            header: t('name'),
            cellClassName: 'font-medium'
          },
          {
            key: 'description',
            header: t('description')
          }
        ],
        labels: {
          add: t('add_skill'),
          edit: t('edit_skill'),
          view: t('view_skill'),
          viewLabel: t('view_label'),
          loading: t('loading'),
          emptyTitle: t('empty_title'),
          emptyDescription: t('empty_description'),
          actions: t('actions'),
          submit: t('submit'),
          update: t('update'),
          close: t('close'),
          previous: t('previous'),
          next: t('next')
        }
      }}
    />
  );
}
