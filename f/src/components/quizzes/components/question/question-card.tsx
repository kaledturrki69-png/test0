'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconEdit
} from '@tabler/icons-react';
import { Clock, ChevronDown } from 'lucide-react';
import {
  Question,
  QuestionAnswer,
  QuestionType,
  QuestionLanguageMode,
  QUESTION_TYPES,
  LANGUAGE_MODES,
  requiresAnswers
} from '@/types/question';
import { QuizTemplate, QuizCategory } from '@/types/quiz';
import { useTranslations } from 'next-intl';

interface QuestionCardProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: (questionId: string | number) => void;
  onSave: (question: Question) => void;
  onCancel?: (question: Question) => void;
  onSaveAndNew?: (question: Question) => void;
  quizzes: QuizTemplate[];
  categories: QuizCategory[];
  saving?: boolean;
  deleting?: boolean;
  hideQuizSelector?: boolean;
  hideLanguageSelectors?: boolean;
  onManageCategory?: () => void;
}

export function QuestionCard({
  question,
  onUpdate,
  onDelete,
  onSave,
  onCancel,
  onSaveAndNew,
  quizzes,
  categories,
  saving = false,
  deleting = false,
  hideQuizSelector = false,
  hideLanguageSelectors = false,
  onManageCategory
}: QuestionCardProps) {
  const t = useTranslations('question_card');
  const tQuiz = useTranslations('quiz_components');
  const [editingAnswerId, setEditingAnswerId] = useState<
    string | number | null
  >(null);
  const [editingAnswerText, setEditingAnswerText] = useState('');

  // Static language options
  const LANGUAGES = [
    { value: 'en', label: tQuiz('english') },
    { value: 'fr', label: tQuiz('french') },
    { value: 'ar', label: tQuiz('arabic') }
  ];

  // Local state for languages (not stored in API for now)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    // Initialize based on language mode
    return question.languageMode === 'FIXED' ? ['en'] : [];
  });

  // Update languages when language mode changes
  useEffect(() => {
    if (question.languageMode === 'FIXED') {
      // If switching to FIXED, keep only first language or set default
      if (selectedLanguages.length === 0) {
        setSelectedLanguages(['en']);
      } else if (selectedLanguages.length > 1) {
        setSelectedLanguages([selectedLanguages[0]]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.languageMode]);

  const handleFieldChange = (field: keyof Question, value: any) => {
    onUpdate({ ...question, [field]: value });
  };

  const handleAddAnswer = () => {
    const newAnswer: QuestionAnswer = {
      id: `answer-${Date.now()}`,
      text: '',
      isCorrect: false
    };
    onUpdate({
      ...question,
      answers: [...question.answers, newAnswer]
    });
    setEditingAnswerId(newAnswer.id);
    setEditingAnswerText('');
  };

  const handleAnswerTextChange = (answerId: string | number, text: string) => {
    onUpdate({
      ...question,
      answers: question.answers.map((a) =>
        a.id === answerId ? { ...a, text } : a
      )
    });
  };

  const handleAnswerCorrectChange = (
    answerId: string | number,
    isCorrect: boolean
  ) => {
    const updatedAnswers = question.answers.map((a) => {
      if (question.type === 'single_choice') {
        return { ...a, isCorrect: a.id === answerId ? isCorrect : false };
      }
      return a.id === answerId ? { ...a, isCorrect } : a;
    });

    onUpdate({
      ...question,
      answers: updatedAnswers
    });
  };

  const handleDeleteAnswer = (answerId: string | number) => {
    onUpdate({
      ...question,
      answers: question.answers.filter((a) => a.id !== answerId)
    });
  };

  const handleStartEditAnswer = (answer: QuestionAnswer) => {
    setEditingAnswerId(answer.id);
    setEditingAnswerText(answer.text);
  };

  const handleFinishEditAnswer = (answerId: string | number) => {
    handleAnswerTextChange(answerId, editingAnswerText);
    setEditingAnswerId(null);
    setEditingAnswerText('');
  };

  const handleSave = () => {
    onSave({ ...question, isExpanded: false });
  };

  const handleSaveAndNew = () => {
    if (onSaveAndNew) {
      onSaveAndNew({ ...question, isExpanded: false });
    }
  };

  const showAnswers = requiresAnswers(question.type);

  const handleCancel = () => {
    // If it's a new question (temp ID), delete it
    if (
      typeof question.id === 'string' &&
      question.id.startsWith('question-')
    ) {
      onDelete(question.id);
    } else {
      // For existing questions, exit edit mode
      if (onCancel) {
        onCancel(question);
      } else {
        // Fallback: just collapse
        onUpdate({ ...question, isExpanded: false });
      }
    }
  };

  return (
    <Card className='space-y-6 rounded-lg border p-6 transition-all'>
      {/* Top Bar */}
      <div className='flex items-center justify-between'>
        {/* Left: Question Type, Quiz, Language Mode Dropdowns */}
        <div className='flex items-center gap-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Label
                htmlFor={`category-${question.id}`}
                className='text-sm font-normal'
              >
                {t('category')}
              </Label>
              {onManageCategory && (
                <button
                  type='button'
                  onClick={onManageCategory}
                  className='text-muted-foreground hover:text-foreground transition-colors'
                  title={t('manage_categories')}
                >
                  <IconEdit className='h-4 w-4' />
                </button>
              )}
            </div>
            <Select
              value={question.categoryId?.toString() || 'none'}
              onValueChange={(value) =>
                handleFieldChange(
                  'categoryId',
                  value === 'none' ? null : parseInt(value)
                )
              }
            >
              <SelectTrigger
                id={`category-${question.id}`}
                className='w-[200px] border-gray-200'
              >
                <SelectValue placeholder={t('select_category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>{t('no_category')}</SelectItem>
                {categories.length === 0 ? (
                  <div className='text-muted-foreground px-2 py-1.5 text-sm'>
                    {t('no_categories_available')}
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label
              htmlFor={`question-type-${question.id}`}
              className='text-sm font-normal'
            >
              {t('question_type')}
            </Label>
            <Select
              value={question.type}
              onValueChange={(value) =>
                handleFieldChange('type', value as QuestionType)
              }
            >
              <SelectTrigger
                id={`question-type-${question.id}`}
                className='w-[180px] border-gray-200'
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!hideQuizSelector && (
            <div className='space-y-2'>
              <Label
                htmlFor={`quiz-${question.id}`}
                className='text-sm font-normal'
              >
                {t('quiz')}
              </Label>
              <Select
                value={question.quizId?.toString() || ''}
                onValueChange={(value) =>
                  handleFieldChange('quizId', value ? parseInt(value) : null)
                }
              >
                <SelectTrigger
                  id={`quiz-${question.id}`}
                  className='w-[200px] border-gray-200'
                >
                  <SelectValue placeholder={t('select_quiz')} />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.length === 0 ? (
                    <div className='text-muted-foreground px-2 py-1.5 text-sm'>
                      {t('no_quizzes_available')}
                    </div>
                  ) : (
                    quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id.toString()}>
                        {quiz.name} ({quiz.version})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          {!hideLanguageSelectors && (
            <div className='space-y-2'>
              <Label
                htmlFor={`language-mode-${question.id}`}
                className='text-sm font-normal'
              >
                {t('language_mode')}
              </Label>
              <Select
                value={question.languageMode}
                onValueChange={(value) => {
                  const newMode = value as QuestionLanguageMode;
                  handleFieldChange('languageMode', newMode);
                  // Reset languages when mode changes
                  if (newMode === 'FIXED') {
                    // When switching to FIXED, keep first language or set default
                    setSelectedLanguages(
                      selectedLanguages.length > 0
                        ? [selectedLanguages[0]]
                        : ['en']
                    );
                  }
                  // For FLEXIBLE, keep existing selections
                }}
              >
                <SelectTrigger
                  id={`language-mode-${question.id}`}
                  className='w-[150px] border-gray-200'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_MODES.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Language Selection Dropdown - shows next to Language Mode */}
          {!hideLanguageSelectors && question.languageMode && (
            <div className='space-y-2'>
              <Label className='text-sm font-normal'>
                {question.languageMode === 'FLEXIBLE'
                  ? t('languages')
                  : t('language')}
              </Label>
              {question.languageMode === 'FIXED' ? (
                // Single select for FIXED mode
                <Select
                  value={selectedLanguages[0] || 'en'}
                  onValueChange={(value) => {
                    setSelectedLanguages([value]);
                  }}
                >
                  <SelectTrigger className='w-[150px] border-gray-200'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                // Multi-select for FLEXIBLE mode
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className='w-[150px] justify-between border-gray-200'
                    >
                      {selectedLanguages.length > 0
                        ? selectedLanguages.length === 1
                          ? LANGUAGES.find(
                              (l) => l.value === selectedLanguages[0]
                            )?.label
                          : t('selected_count', {
                              count: selectedLanguages.length
                            })
                        : t('select_languages')}
                      <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[200px] p-0' align='start'>
                    <div className='space-y-2 p-2'>
                      {LANGUAGES.map((lang) => {
                        const isSelected = selectedLanguages.includes(
                          lang.value
                        );
                        return (
                          <div
                            key={lang.value}
                            className='flex cursor-pointer items-center space-x-2 rounded-md p-2 hover:bg-gray-100'
                            onClick={() => {
                              if (isSelected) {
                                setSelectedLanguages(
                                  selectedLanguages.filter(
                                    (l) => l !== lang.value
                                  )
                                );
                              } else {
                                setSelectedLanguages([
                                  ...selectedLanguages,
                                  lang.value
                                ]);
                              }
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedLanguages([
                                    ...selectedLanguages,
                                    lang.value
                                  ]);
                                } else {
                                  setSelectedLanguages(
                                    selectedLanguages.filter(
                                      (l) => l !== lang.value
                                    )
                                  );
                                }
                              }}
                            />
                            <label className='flex-1 cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                              {lang.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {selectedLanguages.length > 0 && (
                      <div className='border-t p-2'>
                        <div className='flex flex-wrap gap-1'>
                          {selectedLanguages.map((langValue) => {
                            const lang = LANGUAGES.find(
                              (l) => l.value === langValue
                            );
                            return (
                              <Badge
                                key={langValue}
                                variant='secondary'
                                className='text-xs'
                              >
                                {lang?.label || langValue}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )}
            </div>
          )}
        </div>

        {/* Right: Save and Cancel Buttons */}
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleCancel}
            className='gap-2'
            disabled={saving || deleting}
          >
            <IconX className='h-4 w-4' />
            {t('cancel')}
          </Button>
          <Button
            size='sm'
            onClick={handleSave}
            className='gap-2'
            disabled={saving || deleting}
          >
            {saving ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                {typeof question.id === 'number' ? t('updating') : t('saving')}
              </>
            ) : (
              <>
                <IconCheck className='h-4 w-4' />
                {typeof question.id === 'number' ? t('update') : t('save')}
              </>
            )}
          </Button>
          {onSaveAndNew && typeof question.id !== 'number' && (
            <Button
              size='sm'
              variant='secondary'
              onClick={handleSaveAndNew}
              className='gap-2'
              disabled={saving || deleting}
            >
              {saving ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  {t('saving')}
                </>
              ) : (
                <>
                  <IconCheck className='h-4 w-4' />
                  {t('save_and_add_new')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Question Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Label className='text-base font-semibold'>
            {t('question_label')}
            <span className='text-destructive'>*</span>
          </Label>
        </div>

        <div className='space-y-2'>
          <Textarea
            value={question.questionText}
            onChange={(e) => handleFieldChange('questionText', e.target.value)}
            placeholder={t('question_placeholder')}
            className='min-h-[120px] rounded-lg border-gray-200 bg-gray-50'
            rows={4}
          />
        </div>
      </div>

      {/* Yes/No Answer Section */}
      {question.type === 'yes_no' && (
        <div className='space-y-4 rounded-lg border bg-gray-50 p-4'>
          <div className='flex items-center justify-between'>
            <Label className='text-base font-semibold'>
              {t('correct_answer')}
              <span className='text-destructive'>*</span>
            </Label>
          </div>
          <div className='flex items-center gap-6'>
            <div className='flex items-center gap-2'>
              <input
                type='radio'
                id={`yes-answer-${question.id}`}
                name={`yesno-${question.id}`}
                checked={question.correctYesNoAnswer === 'yes'}
                onChange={() => handleFieldChange('correctYesNoAnswer', 'yes')}
                className='h-4 w-4 cursor-pointer'
              />
              <Label
                htmlFor={`yes-answer-${question.id}`}
                className='cursor-pointer text-sm font-medium'
              >
                ✓ {t('yes')}
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='radio'
                id={`no-answer-${question.id}`}
                name={`yesno-${question.id}`}
                checked={question.correctYesNoAnswer === 'no'}
                onChange={() => handleFieldChange('correctYesNoAnswer', 'no')}
                className='h-4 w-4 cursor-pointer'
              />
              <Label
                htmlFor={`no-answer-${question.id}`}
                className='cursor-pointer text-sm font-medium'
              >
                ✗ {t('no')}
              </Label>
            </div>
          </div>
          {!question.correctYesNoAnswer && (
            <p className='text-muted-foreground text-sm'>
              {t('select_correct_answer_yesno')}
            </p>
          )}
        </div>
      )}

      {/* Choices Section */}
      {showAnswers && (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label className='text-base font-semibold'>
              {t('choices')}
              <span className='text-destructive'>*</span>
            </Label>
            <p className='text-muted-foreground text-sm'>
              {question.type === 'single_choice'
                ? t('select_correct_radio')
                : t('check_correct_checkbox')}
            </p>
          </div>

          {/* Answers List */}
          {question.answers.length > 0 && (
            <div className='space-y-2'>
              {question.answers.map((answer) => (
                <div
                  key={answer.id}
                  className='flex items-center gap-3 rounded-lg border bg-white p-3'
                >
                  {/* Radio/Checkbox */}
                  <div className='flex-shrink-0'>
                    {question.type === 'single_choice' ? (
                      <input
                        type='radio'
                        checked={answer.isCorrect}
                        onChange={() =>
                          handleAnswerCorrectChange(answer.id, true)
                        }
                        className='h-4 w-4'
                      />
                    ) : (
                      <Checkbox
                        checked={answer.isCorrect}
                        onCheckedChange={(checked) =>
                          handleAnswerCorrectChange(answer.id, checked === true)
                        }
                      />
                    )}
                  </div>

                  {/* Answer Text Input */}
                  <div className='flex-1'>
                    {editingAnswerId === answer.id ? (
                      <Input
                        value={editingAnswerText}
                        onChange={(e) => setEditingAnswerText(e.target.value)}
                        onBlur={() => handleFinishEditAnswer(answer.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleFinishEditAnswer(answer.id);
                          }
                        }}
                        autoFocus
                        className='border-gray-200 bg-gray-50'
                      />
                    ) : (
                      <div
                        className='hover:bg-muted cursor-pointer rounded border bg-gray-50 p-2'
                        onClick={() => handleStartEditAnswer(answer)}
                      >
                        {answer.text || t('click_to_edit_answer')}
                      </div>
                    )}
                  </div>

                  {/* Delete Icon */}
                  <div className='flex flex-shrink-0 items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeleteAnswer(answer.id)}
                      className='text-destructive hover:text-destructive h-8 w-8 p-0'
                    >
                      <IconTrash className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Answers Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={handleAddAnswer}
            className='w-full border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'
          >
            <IconPlus className='mr-2 h-4 w-4' />
            {t('add_answers')}
          </Button>
        </div>
      )}

      {/* Bottom Settings Bar */}
      <div className='flex items-center justify-between border-t pt-4'>
        {/* Estimation Time */}
        <div className='flex items-center gap-2'>
          <Label className='text-sm font-normal'>{t('estimation_time')}</Label>
          <div className='flex items-center gap-1 rounded-md border px-3 py-1.5'>
            <Input
              type='number'
              value={question.timeLimit}
              onChange={(e) => {
                const seconds = parseInt(e.target.value) || 0;
                handleFieldChange('timeLimit', seconds);
                handleFieldChange('timeUnit', 'seconds');
              }}
              className='h-auto w-12 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0'
              min={0}
            />
            <span className='text-muted-foreground text-sm'>
              {t('seconds')}
            </span>
            <Clock className='text-muted-foreground ml-1 h-4 w-4' />
          </div>
        </div>

        {/* Difficulty (1..5) - same dropdown design as Question Type */}
        <div className='flex items-center gap-2'>
          <Label
            htmlFor={`difficulty-${question.id}`}
            className='text-sm font-normal'
          >
            {t('difficulty')}
          </Label>
          <Select
            value={(question.difficulty ?? 1).toString()}
            onValueChange={(value) =>
              handleFieldChange('difficulty', parseInt(value) || 1)
            }
          >
            <SelectTrigger
              id={`difficulty-${question.id}`}
              className='w-[180px] border-gray-200'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1'>{t('levels.n1')}</SelectItem>
              <SelectItem value='2'>{t('levels.n2')}</SelectItem>
              <SelectItem value='3'>{t('levels.n3')}</SelectItem>
              <SelectItem value='4'>{t('levels.n4')}</SelectItem>
              <SelectItem value='5'>{t('levels.n5')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
