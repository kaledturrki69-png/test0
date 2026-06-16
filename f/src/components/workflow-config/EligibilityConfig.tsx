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
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { useWorkflowConfig } from './use-workflow-config';
import { useTranslations } from 'next-intl';

export function EligibilityConfig({
  node,
  onConfigChange
}: {
  node: any;
  onConfigChange?: (config: any) => void;
}) {
  const { saveConfig, getConfig } = useWorkflowConfig(node, onConfigChange);
  const t = useTranslations('workflow_config');

  const [field, setField] = useState(getConfig('field', ''));
  const [operator, setOperator] = useState(getConfig('operator', '>='));
  const [value, setValue] = useState(getConfig('value', ''));
  const [askIfMissing, setAskIfMissing] = useState(
    getConfig('askIfMissing', true)
  );

  // Sync state when node changes
  useEffect(() => {
    const config = node?.data?.config || {};
    setField(config.field || '');
    setOperator(config.operator || '>=');
    setValue(config.value || '');
    setAskIfMissing(
      config.askIfMissing !== undefined ? config.askIfMissing : true
    );
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className='bg-muted/30'>
      <CardHeader>
        <CardTitle>{t('eligibility.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='space-y-2'>
          <Label>{t('eligibility.field_label')}</Label>
          <Input
            placeholder={t('eligibility.field_placeholder')}
            value={field}
            onChange={(e) => {
              setField(e.target.value);
              saveConfig({ field: e.target.value });
            }}
          />
        </div>
        <div className='space-y-2'>
          <Label>{t('eligibility.operator_label')}</Label>
          <Select
            value={operator}
            onValueChange={(val) => {
              setOperator(val);
              saveConfig({ operator: val });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='>='>≥</SelectItem>
              <SelectItem value='<='>≤</SelectItem>
              <SelectItem value='='>=</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>{t('eligibility.value_label')}</Label>
          <Input
            placeholder={t('eligibility.value_placeholder')}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              saveConfig({ value: e.target.value });
            }}
          />
        </div>
        <div className='flex items-center justify-between'>
          <Label>{t('eligibility.ask_if_missing')}</Label>
          <Switch
            checked={askIfMissing}
            onCheckedChange={(checked) => {
              setAskIfMissing(checked);
              saveConfig({ askIfMissing: checked });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
