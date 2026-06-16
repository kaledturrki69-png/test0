'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import { QuestionCard } from '@/components/quizzes/components';
import { useQuizData } from '@/components/quizzes/hooks';
import { useCategories } from '@/components/quizzes/hooks/quiz/use-categories';
import { Question } from '@/types/question';
import { QuestionService } from '@/services/question-service';
import {
  apiToQuestion,
  questionToApi
} from '@/components/quizzes/utils/question-utils';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { usePageTitle } from '@/hooks/use-page-title';
import { useTranslations } from 'next-intl';

export default function QuestionEditPage() {
  usePageTitle('Edit Question');
  const t = useTranslations('quiz_questions_page');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { data: session } = useSession();

  // Extract current locale from pathname
  const locale = pathname.split('/')[1] || 'en';
  const questionId = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { templates: quizzes } = useQuizData();
  // Fetch categories filtered by the question's quiz template
  const { categories } = useCategories(question?.quizId);

  // Load question by ID
  useEffect(() => {
    const loadQuestion = async () => {
      if (!session?.accessToken || !questionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const questionIdNum = parseInt(questionId, 10);
        if (isNaN(questionIdNum)) {
          toast.error(t('invalid_question_id'));
          router.push(`/${locale}/dashboard/quizzes/question`);
          return;
        }

        const apiQuestion = await QuestionService.getQuestion(
          session.accessToken,
          questionIdNum
        );
        const localQuestion = apiToQuestion(apiQuestion);
        setQuestion({ ...localQuestion, isExpanded: true });
      } catch (error) {
        toast.error(t('failed_load_question'));
        router.push(`/${locale}/dashboard/quizzes/question`);
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [session?.accessToken, questionId, locale, router, t]);

  const handleUpdate = (updatedQuestion: Question) => {
    setQuestion(updatedQuestion);
  };

  const handleSave = async (questionToSave: Question) => {
    if (!session?.accessToken) {
      toast.error(t('not_authenticated'));
      return;
    }

    try {
      setSaving(true);
      const questionIdNum = parseInt(questionId, 10);
      if (isNaN(questionIdNum)) {
        toast.error(t('invalid_question_id'));
        return;
      }

      const apiQuestion = questionToApi(questionToSave);

      // Use PATCH for partial updates
      const savedApiQuestion = await QuestionService.patchQuestion(
        session.accessToken,
        questionIdNum,
        apiQuestion
      );

      const savedQuestion = apiToQuestion(savedApiQuestion);

      setQuestion({ ...savedQuestion, isExpanded: true });
      toast.success(t('question_updated'));

      // Navigate back to questions list
      router.push(`/${locale}/dashboard/quizzes/question`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('failed_save_question');
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/dashboard/quizzes/question`);
  };

  const handleDelete = async (questionIdToDelete: string | number) => {
    if (!session?.accessToken) {
      toast.error(t('not_authenticated'));
      return;
    }

    if (!confirm(t('confirm_delete'))) {
      return;
    }

    try {
      const questionIdNum =
        typeof questionIdToDelete === 'number'
          ? questionIdToDelete
          : parseInt(questionIdToDelete, 10);

      if (isNaN(questionIdNum)) {
        toast.error(t('invalid_question_id'));
        return;
      }

      await QuestionService.deleteQuestion(session.accessToken, questionIdNum);
      toast.success(t('question_deleted'));
      router.push(`/${locale}/dashboard/quizzes/question`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('failed_delete_question');
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <PageContainer scrollable>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <Loader2 className='text-primary mx-auto mb-2 h-8 w-8 animate-spin' />
            <p className='text-muted-foreground'>{t('loading_question')}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!question) {
    return (
      <PageContainer scrollable>
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <p className='text-muted-foreground mb-4'>
            {t('question_not_found')}
          </p>
          <Button
            variant='outline'
            onClick={() => router.push(`/${locale}/dashboard/quizzes/question`)}
          >
            <IconArrowLeft className='mr-2 h-4 w-4' />
            {t('back_to_questions')}
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-semibold'>{t('edit_question')}</h1>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  router.push(`/${locale}/dashboard/quizzes/question`)
                }
              >
                <IconArrowLeft className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <p className='text-muted-foreground text-sm'>
            {t('update_question_details')}
          </p>
        </div>

        {/* Question Card */}
        <QuestionCard
          question={question}
          quizzes={quizzes}
          categories={categories}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
          deleting={false}
          hideQuizSelector={true}
          hideLanguageSelectors={true}
        />
      </div>
    </PageContainer>
  );
}
