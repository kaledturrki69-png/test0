'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  IconBrain,
  IconEdit,
  IconTrash,
  IconPlus,
  IconEye
} from '@tabler/icons-react';
import { QuizTemplate } from '@/types/quiz';
import { getSkillName } from '@/components/quizzes/utils/quiz-utils';
import { Skill } from '@/types/skill';
import { useTranslations } from 'next-intl';

interface QuizGridViewProps {
  templates: QuizTemplate[];
  hardSkills: Skill[];
  softSkills: Skill[];
  onEdit: (template: QuizTemplate) => void;
  onDelete: (template: QuizTemplate) => void;
}

export function QuizGridView({
  templates,
  hardSkills,
  softSkills,
  onEdit,
  onDelete
}: QuizGridViewProps) {
  const t = useTranslations('quiz_components');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const getLanguageName = (code: string | undefined) => {
    switch ((code || '').toLowerCase()) {
      case 'fr':
        return t('french');
      case 'ar':
        return t('arabic');
      case 'en':
      default:
        return t('english');
    }
  };

  const getLanguagesDisplay = (template: QuizTemplate) => {
    const isMulti = (template.language_mode ?? 'fixed') === 'flexible';
    const languageCodes = template.languages || [
      template.language_code || 'en'
    ];

    if (isMulti && languageCodes.length > 1) {
      // Display all languages for multi-language mode
      return languageCodes.map(getLanguageName).join(' / ');
    }

    // Display single language
    return getLanguageName(languageCodes[0] || template.language_code || 'en');
  };

  const handleAddQuestion = (quizId: number) => {
    // Set selected quiz in localStorage
    localStorage.setItem('selectedQuizId', quizId.toString());
    // Navigate to question page (will read from localStorage)
    router.push(`/${locale}/dashboard/quizzes/question`);
  };

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {templates.map((template) => (
        <Card key={template.id} className='transition-shadow hover:shadow-md'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <CardTitle className='text-lg'>{template.name}</CardTitle>
                <CardDescription className='mt-1'>
                  {template.description || t('no_description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2'>
                <IconBrain className='text-muted-foreground h-4 w-4' />
                <span className='font-medium'>{t('skill_label')}</span>
                <Badge variant='outline'>
                  {getSkillName(template.skill, hardSkills, softSkills)}
                </Badge>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{t('questions_label')}</span>
                <span>{template.default_question_count}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{t('paragraph_label')}</span>
                <span>{template.categories.length}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>
                  {(template.language_mode ?? 'fixed') === 'fixed'
                    ? t('single_language_label')
                    : t('multi_language_label')}{' '}
                  {t('language_colon')}
                </span>
                <span>{getLanguagesDisplay(template)}</span>
              </div>
              {template.is_published && (
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>{t('published')}</Badge>
                </div>
              )}
              <div className='flex items-center gap-2 pt-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onEdit(template)}
                >
                  <IconEdit className='mr-1 h-4 w-4' />
                  {t('edit')}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleAddQuestion(template.id)}
                >
                  <IconPlus className='mr-1 h-4 w-4' />
                  {t('question')}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    router.push(
                      `/${locale}/dashboard/quizzes/test-q?templateId=${template.id}`
                    )
                  }
                >
                  <IconEye className='mr-1 h-4 w-4' />
                  {t('view')}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onDelete(template)}
                >
                  <IconTrash className='mr-1 h-4 w-4' />
                  {t('delete')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
