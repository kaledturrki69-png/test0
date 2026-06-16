'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Question, QUESTION_TYPES } from '@/types/question';
import { QuizTemplate, QuizCategory } from '@/types/quiz';
import { useTranslations } from 'next-intl';

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (questionId: string | number) => void;
  quizzes?: QuizTemplate[];
  categories?: QuizCategory[];
}

export function QuestionList({
  questions,
  onEdit,
  onDelete,
  quizzes = [],
  categories = []
}: QuestionListProps) {
  const t = useTranslations('question_list');
  const router = useRouter();
  const pathname = usePathname();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null
  );

  // Extract current locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  if (questions.length === 0) {
    return null;
  }

  const getQuestionTypeLabel = (type: Question['type']) => {
    return QUESTION_TYPES.find((qt) => qt.value === type)?.label || type;
  };

  const getQuizName = (quizId: number | null) => {
    if (!quizId) return t('no_quiz');
    const quiz = quizzes.find((q) => q.id === quizId);
    return quiz ? `${quiz.name} (${quiz.version})` : `Quiz #${quizId}`;
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return null;
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : null;
  };

  const handleEdit = (question: Question) => {
    // Navigate to edit page if question has numeric ID, otherwise use onEdit
    if (typeof question.id === 'number') {
      router.push(`/${locale}/dashboard/quizzes/question/${question.id}`);
    } else {
      onEdit(question);
    }
  };

  return (
    <div className='mt-6 space-y-3'>
      <h3 className='text-lg font-semibold'>{t('saved_questions')}</h3>
      {questions.map((question) => (
        <Card key={question.id} className='transition-shadow hover:shadow-md'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='mb-2 flex items-center gap-2'>
                  {question.quizId && (
                    <Badge variant='default'>
                      {getQuizName(question.quizId)}
                    </Badge>
                  )}
                  {question.categoryId &&
                    getCategoryName(question.categoryId) && (
                      <Badge variant='secondary'>
                        {getCategoryName(question.categoryId)}
                      </Badge>
                    )}
                  <Badge variant='outline'>
                    {getQuestionTypeLabel(question.type)}
                  </Badge>
                  {question.type === 'yes_no' &&
                    question.correctYesNoAnswer && (
                      <Badge variant='default'>
                        {t('correct')}{' '}
                        {question.correctYesNoAnswer === 'yes'
                          ? t('yes')
                          : t('no')}
                      </Badge>
                    )}
                  <Badge variant='secondary'>{question.languageMode}</Badge>
                  {question.answers.length > 0 && (
                    <Badge variant='outline'>
                      {question.answers.length}{' '}
                      {question.answers.length === 1
                        ? t('answer')
                        : t('answers')}
                    </Badge>
                  )}
                </div>
                <CardTitle className='text-base font-medium'>
                  {question.questionText || t('untitled_question')}
                </CardTitle>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleEdit(question)}
                >
                  <IconEdit className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setQuestionToDelete(question);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <IconTrash className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='text-muted-foreground flex items-center gap-4 text-sm'>
              <span>
                {t('time')} {question.timeLimit} {question.timeUnit}
              </span>
              <span>
                {t('score')} {question.score} {t('points')}
              </span>
              <span>
                {t('difficulty')} {question.difficulty}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_question')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_delete_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (questionToDelete) {
                  onDelete(questionToDelete.id);
                  setDeleteDialogOpen(false);
                  setQuestionToDelete(null);
                }
              }}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
