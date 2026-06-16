'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';
import { Category } from '@/types/category';
import { useTranslations } from 'next-intl';

interface Workplace {
  id: number;
  name: string;
}

interface PositionBasicFieldsProps {
  name: string;
  description: string;
  expectedHiringDate: string;
  numberToHire: number | '';
  numberToShortlist: number | '';
  status: 'open' | 'closed';
  categoryId: number;
  workplace: number | '';
  categories: Category[];
  workplaces: Workplace[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onExpectedHiringDateChange: (value: string) => void;
  onNumberToHireChange: (value: number | '') => void;
  onNumberToShortlistChange: (value: number | '') => void;
  onStatusChange: (value: 'open' | 'closed') => void;
  onCategoryChange: (value: number) => void;
  onWorkplaceChange: (value: number | '') => void;
  isViewMode?: boolean;
  loading?: boolean;
}

export function PositionBasicFields({
  name,
  description,
  expectedHiringDate,
  numberToHire,
  numberToShortlist,
  status,
  categoryId,
  workplace,
  categories,
  workplaces,
  onNameChange,
  onDescriptionChange,
  onExpectedHiringDateChange,
  onNumberToHireChange,
  onNumberToShortlistChange,
  onStatusChange,
  onCategoryChange,
  onWorkplaceChange,
  isViewMode = false,
  loading = false
}: PositionBasicFieldsProps) {
  const t = useTranslations('jobfile');

  return (
    <>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Input
          placeholder={t('name_placeholder')}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={loading || isViewMode}
          readOnly={isViewMode}
        />
        <div className='space-y-2'>
          <label className='text-sm font-medium'>{t('category')}</label>
          <Select
            value={categoryId.toString()}
            onValueChange={(value) => onCategoryChange(parseInt(value))}
            disabled={loading || isViewMode}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          type='date'
          placeholder={t('expected_date')}
          value={expectedHiringDate}
          onChange={(e) => onExpectedHiringDateChange(e.target.value)}
          disabled={loading || isViewMode}
          readOnly={isViewMode}
        />
        <div className='space-y-2'>
          <label className='text-sm font-medium'>{t('status')}</label>
          <Select
            value={status}
            onValueChange={(value: 'open' | 'closed') => onStatusChange(value)}
            disabled={loading || isViewMode}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='open'>{t('open')}</SelectItem>
              <SelectItem value='closed'>{t('closed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          type='number'
          placeholder={t('number_to_hire')}
          value={numberToHire}
          onChange={(e) =>
            onNumberToHireChange(e.target.value ? Number(e.target.value) : '')
          }
          disabled={loading || isViewMode}
          readOnly={isViewMode}
        />
        <Input
          type='number'
          placeholder={t('number_to_shortlist')}
          value={numberToShortlist}
          onChange={(e) =>
            onNumberToShortlistChange(
              e.target.value ? Number(e.target.value) : ''
            )
          }
          disabled={loading || isViewMode}
          readOnly={isViewMode}
        />
        <div className='space-y-2'>
          <label className='text-sm font-medium'>{t('workplace')}</label>
          {isViewMode ? (
            <div className='text-muted-foreground text-sm'>
              {workplaces.find((w) => w.id === workplace)?.name ||
                (workplace ? String(workplace) : t('no_workplace'))}
            </div>
          ) : (
            <Select
              value={workplace ? workplace.toString() : undefined}
              onValueChange={(value) =>
                onWorkplaceChange(value ? Number(value) : '')
              }
              disabled={loading || isViewMode}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('select_workplace')} />
              </SelectTrigger>
              <SelectContent>
                {workplaces.map((wp) => (
                  <SelectItem key={wp.id} value={wp.id.toString()}>
                    {wp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>{t('description')}</label>
        {isViewMode ? (
          <div
            className='prose prose-sm max-w-none rounded-md border p-3'
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : (
          <WysiwygEditor
            content={description}
            onChange={onDescriptionChange}
            placeholder={t('description_placeholder')}
          />
        )}
      </div>
    </>
  );
}
