'use client';

import { GenericCrudPage } from '@/components/crud';
import { Condition } from '@/types/condition';
import { usePageTitle } from '@/hooks/use-page-title';
import { useTranslations } from 'next-intl';

export default function ConditionsPage() {
  usePageTitle('Conditions');
  const t = useTranslations('ConditionsPage');

  return (
    <GenericCrudPage<Condition>
      config={{
        title: t('title'),
        subtitle: t('subtitle'),
        translations: 'ConditionsPage',
        apiEndpoint: '/api/conditions',
        responseKey: 'conditions', // API returns { conditions: [...] }
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
          },
          {
            key: 'formula',
            type: 'input',
            placeholder: t('formula')
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
          },
          {
            key: 'formula',
            header: t('formula'),
            render: (condition) => condition.formula || '-'
          }
        ],
        labels: {
          add: t('add_condition'),
          edit: t('edit_condition'),
          view: t('view_condition'),
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
