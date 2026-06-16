'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconArrowLeft } from '@tabler/icons-react';
import { QuestionCard } from '@/components/quizzes/components';
import { useQuestions } from '@/components/quizzes/hooks';
import { useQuizData } from '@/components/quizzes/hooks';
import { useCategories } from '@/components/quizzes/hooks/quiz/use-categories';
import { CategoryFormDialog } from '@/components/quizzes/components/quiz/category-form-dialog';
import { useCategoryForm } from '@/components/quizzes/hooks/quiz/use-category-form';
import { toast } from 'sonner';
import { usePageTitle } from '@/hooks/use-page-title';
import { useTranslations } from 'next-intl';

export default function NewQuestionPage() {
  usePageTitle('New Question');
  const t = useTranslations('quiz_questions_page');
  const router = useRouter();
  const pathname = usePathname();

  // Extract current locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  const {
    questions,
    saving,
    addNewQuestion,
    updateQuestion,
    deleteQuestion,
    saveQuestion
  } = useQuestions();

  // Get quiz info from localStorage
  const selectedQuizId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedQuizId');
      return stored ? parseInt(stored, 10) : null;
    }
    return null;
  }, []);

  const { templates: quizzes } = useQuizData();
  // Fetch categories filtered by selected quiz template
  const { categories, refreshCategories } = useCategories(selectedQuizId);

  const [currentQuestionId, setCurrentQuestionId] = useState<
    string | number | null
  >(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const { creating, updating, handleCreate, handleUpdate } = useCategoryForm(
    () => {
      refreshCategories();
    },
    () => {
      refreshCategories();
    }
  );

  const handleCreateCategory = async (formData: {
    template: number;
    name: string;
    description: string;
    weight: number;
  }) => {
    await handleCreate(formData);
    setShowCategoryDialog(false);
    refreshCategories();
  };

  const handleUpdateCategory = async (
    id: number,
    formData: {
      template: number;
      name: string;
      description: string;
      weight: number;
    }
  ) => {
    await handleUpdate(id, formData);
    setShowCategoryDialog(false);
    refreshCategories();
  };

  // Add a new question on mount
  useEffect(() => {
    const newQuestionId = addNewQuestion(selectedQuizId || undefined);
    setCurrentQuestionId(newQuestionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  // When categories load, ensure the question has a default category selected
  useEffect(() => {
    if (!currentQuestion) return;
    if (!categories || categories.length === 0) return;
    if (currentQuestion.categoryId) return;

    const defaultCategoryId = categories[0]?.id;
    if (defaultCategoryId) {
      updateQuestion({ ...currentQuestion, categoryId: defaultCategoryId });
    }
  }, [categories, currentQuestion, updateQuestion]);

  const selectedQuizName = useMemo(() => {
    if (selectedQuizId === null) return null;
    const quiz = quizzes.find((q) => q.id === selectedQuizId);
    return quiz?.name || null;
  }, [selectedQuizId, quizzes]);

  const handleBack = () => {
    router.push(`/${locale}/dashboard/quizzes/question`);
  };

  const handleSave = async () => {
    if (currentQuestion) {
      await saveQuestion(currentQuestion);
      router.push(`/${locale}/dashboard/quizzes/question`);
    }
  };

  const handleSaveAndNew = async () => {
    if (currentQuestion) {
      try {
        await saveQuestion(currentQuestion);
        toast.success(t('question_saved'));

        // Create a new empty question with the same quizId
        const newQuestionId = addNewQuestion(
          currentQuestion.quizId || undefined
        );
        setCurrentQuestionId(newQuestionId);
      } catch (error) {
        // Error already handled in useQuestions hook
      }
    }
  };

  const handleCancel = () => {
    if (currentQuestionId) {
      deleteQuestion(currentQuestionId);
    }
    handleBack();
  };

  if (!currentQuestion) {
    return (
      <PageContainer scrollable>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-semibold'>
              {t('create_new_question')}
            </h1>
            <Button variant='outline' size='sm' onClick={handleBack}>
              <IconArrowLeft className='h-4 w-4' />
            </Button>
          </div>
          <p>{t('loading')}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        {/* Header */}
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-semibold'>
              {t('create_new_question')}
            </h1>
            <Button variant='outline' size='sm' onClick={handleBack}>
              <IconArrowLeft className='h-4 w-4' />
            </Button>
          </div>
          {selectedQuizName && (
            <div className='flex items-center gap-2'>
              <p className='text-muted-foreground text-sm'>{t('quiz_label')}</p>
              <Badge variant='secondary' className='text-sm'>
                {selectedQuizName}
              </Badge>
            </div>
          )}
        </div>

        {/* Question Form */}
        <QuestionCard
          question={currentQuestion}
          quizzes={quizzes}
          categories={categories}
          onUpdate={updateQuestion}
          onDelete={() => {
            deleteQuestion(currentQuestion.id);
            handleBack();
          }}
          onSave={handleSave}
          onSaveAndNew={handleSaveAndNew}
          onCancel={handleCancel}
          saving={saving === currentQuestion.id}
          hideQuizSelector={true}
          hideLanguageSelectors={true}
          onManageCategory={() => setShowCategoryDialog(true)}
        />

        {/* Category Form Dialog */}
        <CategoryFormDialog
          open={showCategoryDialog}
          onOpenChange={setShowCategoryDialog}
          onSubmit={handleCreateCategory}
          onUpdate={handleUpdateCategory}
          loading={creating}
          updating={updating}
          templates={quizzes}
          categories={categories}
          selectedQuizId={selectedQuizId}
        />
      </div>
    </PageContainer>
  );
}
