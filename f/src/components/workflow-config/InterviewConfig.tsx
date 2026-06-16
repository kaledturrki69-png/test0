'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useWorkflowConfig } from './use-workflow-config';
import { useTranslations } from 'next-intl';

export function InterviewConfig({
  node,
  onConfigChange
}: {
  node: any;
  onConfigChange?: (config: any) => void;
}) {
  const { saveConfig, getConfig } = useWorkflowConfig(node, onConfigChange);
  const t = useTranslations('workflow_config');

  const [title, setTitle] = useState(getConfig('title', ''));
  const [evaluationType, setEvaluationType] = useState(
    getConfig('evaluationType', 'yes/no')
  );

  // Sync state when node changes
  useEffect(() => {
    const config = node?.data?.config || {};
    setTitle(config.title || '');
    setEvaluationType(config.evaluationType || 'yes/no');
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🧩 Automatically generate and store caption (not visible in UI)
  useEffect(() => {
    const caption = title
      ? t('interview.caption', { title, evaluationType })
      : t('interview.caption_without_title', { evaluationType });
    saveConfig({ caption });
  }, [title, evaluationType, t]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className='bg-muted/30'>
      <CardHeader>
        <CardTitle>{t('interview.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='space-y-2'>
          <Label>{t('interview.interview_title')}</Label>
          <Input
            placeholder={t('interview.interview_placeholder')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              saveConfig({ title: e.target.value });
            }}
          />
        </div>

        <div className='space-y-2'>
          <Label>{t('interview.evaluation_type')}</Label>
          <Select
            value={evaluationType}
            onValueChange={(value) => {
              setEvaluationType(value);
              saveConfig({ evaluationType: value });
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t('interview.select_evaluation_type')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='yes/no'>{t('interview.yes_no')}</SelectItem>
              <SelectItem value='1-5 score'>
                {t('interview.score_1_5')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
