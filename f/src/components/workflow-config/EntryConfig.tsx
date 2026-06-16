'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider'; // ✅ using shadcn/ui slider
import { useState, useEffect } from 'react';
import { useWorkflowConfig } from './use-workflow-config';
import { useTranslations } from 'next-intl';

export function EntryConfig({
  node,
  onConfigChange
}: {
  node: any;
  onConfigChange?: (config: any) => void;
}) {
  const t = useTranslations('workflow_config');
  const { saveConfig, getConfig } = useWorkflowConfig(node, onConfigChange);

  const [isAuto, setIsAuto] = useState(getConfig('isAuto', true));
  const [scoreMatching, setScoreMatching] = useState<number>(
    getConfig('scoreMatching', 15)
  );

  // Initialize defaults
  useEffect(() => {
    const config = node?.data?.config || {};
    if (
      config.clientInterest === undefined ||
      config.scoreMatching === undefined ||
      config.isAuto === undefined ||
      config.caption === undefined
    ) {
      const defaults = {
        clientInterest: true,
        scoreMatching:
          config.scoreMatching !== undefined ? config.scoreMatching : 15,
        isAuto: config.isAuto !== undefined ? config.isAuto : true,
        caption: t('entry.caption', {
          mode: t(isAuto ? 'entry.auto' : 'entry.manual'),
          score: scoreMatching
        })
      };
      saveConfig(defaults);
    }
  }, [node?.id, isAuto, scoreMatching, t]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep caption automatically in sync when relevant fields change
  useEffect(() => {
    const autoCaption = t('entry.caption', {
      mode: t(isAuto ? 'entry.auto' : 'entry.manual'),
      score: scoreMatching
    });
    saveConfig({ caption: autoCaption });
  }, [isAuto, scoreMatching, t]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className='bg-muted/30'>
      <CardHeader>
        <CardTitle>{t('entry.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Client Interest (fixed) */}
        <div className='flex items-center space-x-2'>
          <Checkbox id='client-interest' checked={true} disabled />
          <Label htmlFor='client-interest' className='cursor-not-allowed'>
            {t('entry.client_interest')}
          </Label>
        </div>

        {/* Score Matching Slider */}
        <div className='space-y-2'>
          <Label htmlFor='score-matching'>{t('entry.minimum_score')}</Label>
          <div className='flex flex-col space-y-1'>
            <Slider
              id='score-matching'
              min={15}
              max={100}
              step={1}
              value={[scoreMatching]}
              onValueChange={(value) => {
                const newScore = value[0];
                setScoreMatching(newScore);
                saveConfig({ scoreMatching: newScore });
              }}
            />
            <div className='text-muted-foreground text-right text-xs'>
              {scoreMatching}%
            </div>
          </div>
        </div>

        {/* Auto / Manual Switch */}
        <div className='flex items-center justify-between'>
          <Label htmlFor='auto-manual'>{t('entry.mode')}</Label>
          <div className='flex items-center space-x-2'>
            <Label
              htmlFor='auto-manual'
              className={!isAuto ? 'font-medium' : ''}
            >
              {t('entry.manual')}
            </Label>
            <Switch
              id='auto-manual'
              checked={isAuto}
              onCheckedChange={(checked) => {
                setIsAuto(checked);
                saveConfig({ isAuto: checked });
              }}
            />
            <Label
              htmlFor='auto-manual'
              className={isAuto ? 'font-medium' : ''}
            >
              {t('entry.auto')}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
