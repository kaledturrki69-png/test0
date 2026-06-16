'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { useWorkflowConfig } from './use-workflow-config';
import { useTranslations } from 'next-intl';

export function DeclineConfig({
  node,
  onConfigChange
}: {
  node: any;
  onConfigChange?: (config: any) => void;
}) {
  const { saveConfig, getConfig } = useWorkflowConfig(node, onConfigChange);
  const t = useTranslations('workflow_config');

  const [isAuto, setIsAuto] = useState(getConfig('isAuto', true));

  // Initialize default if not set
  useEffect(() => {
    const config = node?.data?.config || {};
    if (config.isAuto === undefined) {
      saveConfig({ isAuto: true });
    }
  }, [node?.id, saveConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync state when switching between nodes
  useEffect(() => {
    const config = node?.data?.config || {};
    setIsAuto(config.isAuto !== undefined ? config.isAuto : true);
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🧩 Auto-generate caption (not visible in UI)
  useEffect(() => {
    const caption = isAuto
      ? t('decline.caption_auto')
      : t('decline.caption_manual');
    saveConfig({ caption });
  }, [isAuto, t]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className='bg-muted/30'>
      <CardHeader>
        <CardTitle>{t('decline.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex items-center justify-between space-x-2'>
          <Label htmlFor='auto-switch'>{t('decline.auto_label')}</Label>
          <Switch
            id='auto-switch'
            checked={isAuto}
            onCheckedChange={(checked) => {
              setIsAuto(checked);
              saveConfig({ isAuto: checked });
            }}
          />
        </div>
        <p className='text-muted-foreground text-sm'>
          {t('decline.description')}
        </p>
      </CardContent>
    </Card>
  );
}
