'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function EndConfig() {
  const t = useTranslations('workflow_config');
  return (
    <Card className='bg-muted/30'>
      <CardHeader>
        <CardTitle>{t('end.title')}</CardTitle>
      </CardHeader>
      <CardContent>{t('end.description')}</CardContent>
    </Card>
  );
}
