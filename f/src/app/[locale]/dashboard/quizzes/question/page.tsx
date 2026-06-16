'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  IconPlus,
  IconArrowLeft,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { QuestionList } from '@/components/quizzes/components';
import { useQuestions } from '@/components/quizzes/hooks';
import { useQuizData } from '@/components/quizzes/hooks';
import { useCategories } from '@/components/quizzes/hooks/quiz/use-categories';
import { Question, QUESTION_TYPES } from '@/types/question';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
import { DataTableView, TableColumn } from '@/components/views';
import { Grid3X3, List } from 'lucide-react';
import { usePageTitle } from '@/hooks/use-page-title';
import { useTranslations } from 'next-intl';

export default function QuestionPage() {
  usePageTitle('Questions');
  const t = useTranslations('quiz_questions_page');
  const router = useRouter();
  const pathname = usePathname();

  // Extract current locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedQuizId');
      return stored ? parseInt(stored, 10) : null;
    }
    return null;
  });

  const { questions, loading, deleteQuestion, editQuestion } = useQuestions();

  const { templates: quizzes } = useQuizData();
  const { categories } = useCategories(selectedQuizId);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>(
    'all'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null
  );

  // Save selectedQuizId to localStorage whenever it changes
  useEffect(() => {
    if (selectedQuizId !== null) {
      localStorage.setItem('selectedQuizId', selectedQuizId.toString());
    } else {
      localStorage.removeItem('selectedQuizId');
    }
  }, [selectedQuizId]);

  // Reset category filter when quiz changes
  useEffect(() => {
    setSelectedCategoryId('all');
  }, [selectedQuizId]);

  const filteredQuestions = useMemo(() => {
    let quizCategoryIds: number[] = [];
    if (selectedQuizId !== null) {
      const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);
      if (
        selectedQuiz &&
        selectedQuiz.categories &&
        Array.isArray(selectedQuiz.categories)
      ) {
        quizCategoryIds = selectedQuiz.categories
          .filter((cat) => cat && cat.id)
          .map((cat) => cat.id);
      }
    }

    const filtered = questions.filter((q: Question) => {
      if (typeof q.id === 'string') return false;
      if (selectedQuizId !== null) {
        if (quizCategoryIds.length === 0) {
          return false;
        }
        if (q.categoryId === null || !quizCategoryIds.includes(q.categoryId)) {
          return false;
        }
      }

      if (selectedCategoryId !== 'all' && q.categoryId !== selectedCategoryId) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (typeof a.id === 'number' && typeof b.id === 'number') {
        return b.id - a.id;
      }
      return 0;
    });
  }, [questions, selectedCategoryId, selectedQuizId, quizzes]);

  const getQuestionTypeLabel = (type: Question['type']) => {
    return QUESTION_TYPES.find((t) => t.value === type)?.label || type;
  };

  // Helper functions - memoized since they're used in useMemo dependencies
  const getQuizName = useCallback(
    (quizId: number | null) => {
      if (!quizId) return t('no_quiz');
      const quiz = quizzes.find((q) => q.id === quizId);
      return quiz ? `${quiz.name} (${quiz.version})` : `Quiz #${quizId}`;
    },
    [quizzes, t]
  );

  const getCategoryName = useCallback(
    (categoryId: number | null) => {
      if (!categoryId) return t('no_category');
      const category = categories.find((c) => c.id === categoryId);
      return category ? category.name : t('no_category');
    },
    [categories, t]
  );

  // Table columns configuration
  const tableColumns: TableColumn<Question>[] = useMemo(
    () => [
      {
        key: 'questionText',
        header: t('question_header'),
        minWidth: 'min-w-[200px]',
        width: '300px',
        cellClassName: 'font-medium whitespace-normal break-words',
        render: (question: Question) => (
          <div
            className='break-words whitespace-normal'
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word'
            }}
          >
            {question.questionText || 'Untitled Question'}
          </div>
        )
      },
      {
        key: 'quizId',
        header: t('quiz_label').replace(':', ''),
        minWidth: 'min-w-[120px]',
        cellClassName: 'whitespace-nowrap',
        render: (question: Question) => (
          <Badge variant='outline'>{getQuizName(question.quizId)}</Badge>
        )
      },
      {
        key: 'categoryId',
        header: 'Category',
        minWidth: 'min-w-[100px]',
        cellClassName: 'whitespace-nowrap',
        render: (question: Question) => (
          <Badge variant='secondary'>
            {getCategoryName(question.categoryId)}
          </Badge>
        )
      },
      {
        key: 'type',
        header: 'Type',
        minWidth: 'min-w-[120px]',
        cellClassName: 'whitespace-nowrap',
        render: (question: Question) => (
          <Badge variant='outline'>{getQuestionTypeLabel(question.type)}</Badge>
        )
      },
      {
        key: 'languageMode',
        header: 'Language Mode',
        minWidth: 'min-w-[120px]',
        cellClassName: 'whitespace-nowrap',
        render: (question: Question) => (
          <Badge variant='secondary'>{question.languageMode}</Badge>
        )
      },
      {
        key: 'answers',
        header: 'Answers',
        render: (question: Question) => {
          if (question.type === 'yes_no' && question.correctYesNoAnswer) {
            return (
              <Badge variant='default'>
                Correct: {question.correctYesNoAnswer === 'yes' ? 'Yes' : 'No'}
              </Badge>
            );
          }
          return (
            <span className='text-sm'>
              {question.answers.length} answer
              {question.answers.length !== 1 ? 's' : ''}
            </span>
          );
        }
      },
      {
        key: 'timeLimit',
        header: 'Time',
        render: (question: Question) => (
          <span className='text-sm'>
            {question.timeLimit} {question.timeUnit}
          </span>
        )
      },
      {
        key: 'score',
        header: 'Score',
        render: (question: Question) => (
          <span className='text-sm'>{question.score} points</span>
        )
      }
    ],
    [getQuizName, getCategoryName, t]
  );

  // Get selected quiz name
  const selectedQuizName = useMemo(() => {
    if (selectedQuizId === null) return null;
    const quiz = quizzes.find((q) => q.id === selectedQuizId);
    return quiz?.name || null;
  }, [selectedQuizId, quizzes]);

  // Categories are already filtered by the API based on selectedQuizId
  // No need for client-side filtering anymore

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        {/* Header with Title, Actions, and Filters */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <h1 className='text-2xl font-semibold'>
                  {t('questions_title')}
                </h1>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => router.push(`/${locale}/dashboard/quizzes`)}
                >
                  <IconArrowLeft className='h-4 w-4' />
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/${locale}/dashboard/quizzes/question/new`)
                  }
                >
                  <IconPlus className='mr-2 h-4 w-4' />
                  {t('add_question')}
                </Button>
              </div>
              <div className='flex items-center gap-2'>
                <p className='text-muted-foreground text-sm'>
                  {t('create_manage_description')}
                </p>
                {selectedQuizName && (
                  <>
                    <Badge variant='secondary' className='text-sm'>
                      {t('quiz_label')} {selectedQuizName}
                    </Badge>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setSelectedQuizId(null);
                        localStorage.removeItem('selectedQuizId');
                      }}
                      className='h-6 px-2'
                      title={t('clear_quiz_filter')}
                    >
                      ×
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className='flex items-center gap-4'>
              {/* Filters */}
              <div className='flex items-center gap-2'>
                <Label
                  htmlFor='category-filter'
                  className='text-sm whitespace-nowrap'
                >
                  {t('filter_by_category')}
                </Label>
                <div className='w-[200px]'>
                  <Select
                    value={selectedCategoryId.toString()}
                    onValueChange={(value) =>
                      setSelectedCategoryId(
                        value === 'all' ? 'all' : parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger id='category-filter'>
                      <SelectValue placeholder={t('all_categories')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>{t('all_categories')}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-muted-foreground text-sm'>
                  {t('view_label')}
                </span>
                <div className='flex rounded-lg border border-gray-200 p-1'>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('grid')}
                    className='h-8 w-8 p-0'
                  >
                    <Grid3X3 className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('table')}
                    className='h-8 w-8 p-0'
                  >
                    <List className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
              <p className='text-muted-foreground'>{t('loading_questions')}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredQuestions.length === 0 && (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <p className='text-muted-foreground'>{t('no_questions_found')}</p>
            <Button
              onClick={() =>
                router.push(`/${locale}/dashboard/quizzes/question/new`)
              }
              className='mt-4'
              variant='outline'
            >
              <IconPlus className='mr-2 h-4 w-4' />
              {t('add_question')}
            </Button>
          </div>
        )}

        {/* Saved Questions List */}
        {viewMode === 'grid' ? (
          <QuestionList
            questions={filteredQuestions}
            quizzes={quizzes}
            categories={categories}
            onEdit={editQuestion}
            onDelete={deleteQuestion}
          />
        ) : (
          <>
            {/* Desktop Table View - hidden on mobile */}
            <div className='flex hidden flex-col md:block'>
              <div className='-m-1.5 overflow-x-auto'>
                <div className='inline-block min-w-full p-1.5 align-middle'>
                  <div className='overflow-hidden rounded-lg shadow'>
                    <DataTableView
                      data={filteredQuestions}
                      columns={tableColumns}
                      getRowId={(question) => String(question.id)}
                      actionColumn={{
                        header: t('actions'),
                        buttons: [
                          {
                            label: t('edit_question'),
                            icon: <IconEdit className='h-4 w-4' />,
                            variant: 'ghost',
                            onClick: (question: Question) => {
                              if (typeof question.id === 'number') {
                                router.push(
                                  `/${locale}/dashboard/quizzes/question/${question.id}`
                                );
                              } else {
                                editQuestion(question);
                              }
                            }
                          },
                          {
                            label: t('delete_question'),
                            icon: <IconTrash className='h-4 w-4' />,
                            variant: 'ghost',
                            onClick: (question: Question) => {
                              setQuestionToDelete(question);
                              setDeleteDialogOpen(true);
                            }
                          }
                        ]
                      }}
                      emptyState={
                        <div className='flex flex-col items-center justify-center py-12 text-center'>
                          <p className='text-muted-foreground mb-4'>
                            {t('get_started_create')}
                          </p>
                          <Button
                            onClick={() =>
                              router.push(
                                `/${locale}/dashboard/quizzes/question/new`
                              )
                            }
                            variant='outline'
                          >
                            <IconPlus className='mr-2 h-4 w-4' />
                            {t('add_question')}
                          </Button>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Grid View - shown only on mobile */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden'>
              {filteredQuestions
                .filter((q: Question) => !q.isExpanded)
                .map((question: Question) => (
                  <div
                    key={question.id}
                    className='space-y-3 rounded-lg bg-white p-4 shadow'
                  >
                    {/* Question Text */}
                    <div className='text-sm font-medium text-gray-700'>
                      {question.questionText || 'Untitled Question'}
                    </div>

                    {/* Info Row */}
                    <div className='flex items-center space-x-2 text-sm'>
                      <Badge variant='outline'>
                        {getQuizName(question.quizId)}
                      </Badge>
                      <Badge variant='secondary'>
                        {getCategoryName(question.categoryId)}
                      </Badge>
                      <Badge variant='outline'>
                        {getQuestionTypeLabel(question.type)}
                      </Badge>
                    </div>

                    {/* Additional Info Row */}
                    <div className='flex items-center space-x-2 text-sm text-gray-500'>
                      <span>{question.languageMode}</span>
                      {question.type === 'yes_no' &&
                        question.correctYesNoAnswer && (
                          <Badge variant='default'>
                            Correct:{' '}
                            {question.correctYesNoAnswer === 'yes'
                              ? 'Yes'
                              : 'No'}
                          </Badge>
                        )}
                      {question.answers.length > 0 && (
                        <span>
                          {question.answers.length} answer
                          {question.answers.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Time and Score */}
                    <div className='flex items-center space-x-4 text-sm'>
                      <span>
                        Time: {question.timeLimit} {question.timeUnit}
                      </span>
                      <span>Score: {question.score} points</span>
                    </div>

                    {/* Actions */}
                    <div className='flex items-center gap-2 border-t pt-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          if (typeof question.id === 'number') {
                            router.push(
                              `/${locale}/dashboard/quizzes/question/${question.id}`
                            );
                          } else {
                            editQuestion(question);
                          }
                        }}
                      >
                        <IconEdit className='mr-2 h-4 w-4' />
                        {t('edit_question')}
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setQuestionToDelete(question);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <IconTrash className='mr-2 h-4 w-4' />
                        {t('delete_question')}
                      </Button>
                    </div>
                  </div>
                ))}

              {/* Empty State for Mobile */}
              {filteredQuestions.length === 0 && (
                <div className='col-span-full flex flex-col items-center justify-center py-12 text-center'>
                  <p className='text-muted-foreground mb-4'>
                    {t('get_started_create')}
                  </p>
                  <Button
                    onClick={() =>
                      router.push(`/${locale}/dashboard/quizzes/question/new`)
                    }
                    variant='outline'
                  >
                    <IconPlus className='mr-2 h-4 w-4' />
                    {t('add_question')}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('delete_question')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirm_delete')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (questionToDelete) {
                    try {
                      await deleteQuestion(questionToDelete.id);
                      setDeleteDialogOpen(false);
                      setQuestionToDelete(null);
                    } catch (error) {
                      // Error already handled in useQuestions hook
                    }
                  }
                }}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
}
