import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Question } from '@/types/question';
import { QuestionService } from '@/services/question-service';
import { questionToApi, apiToQuestion } from '../../utils/question-utils';

const initialQuestion: Omit<Question, 'id'> = {
  quizId: null,
  categoryId: null,
  type: 'single_choice',
  difficulty: 1,
  languageMode: 'FLEXIBLE',
  questionText: '',
  answers: [],
  correctYesNoAnswer: null,
  timeLimit: 60,
  timeUnit: 'seconds',
  score: 1,
  isExpanded: true
};

export function useQuestions() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | number | null>(null);
  const [deleting, setDeleting] = useState<string | number | null>(null);

  // Fetch questions from API on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiQuestions = await QuestionService.getQuestions(
          session.accessToken
        );
        const localQuestions = apiQuestions.map(apiToQuestion);
        // Merge with existing local questions (preserve expanded/new questions)
        setQuestions((prev) => {
          // Keep any temporary questions (with string IDs) that aren't in the API response
          const tempQuestions = prev.filter(
            (q) =>
              typeof q.id === 'string' &&
              !localQuestions.some((lq) => lq.id === q.id)
          );
          return [...localQuestions, ...tempQuestions];
        });
      } catch (error) {
        toast.error('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [session?.accessToken]);

  const addNewQuestion = useCallback((quizId?: number | null) => {
    const newQuestion: Question = {
      ...initialQuestion,
      id: `question-${Date.now()}`,
      quizId: quizId ?? null
    };
    setQuestions((prev) => [...prev, newQuestion]);
    return newQuestion.id;
  }, []);

  const updateQuestion = useCallback((updatedQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  }, []);

  const deleteQuestion = useCallback(
    async (questionId: string | number) => {
      if (!session?.accessToken) {
        toast.error('Please sign in to delete questions');
        return;
      }

      // If it's a temporary ID (string starting with 'question-' or 'choice-'), just remove from local state
      if (
        typeof questionId === 'string' &&
        questionId.startsWith('question-')
      ) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        return;
      }

      // Otherwise, delete from API
      try {
        setDeleting(questionId);
        await QuestionService.deleteQuestion(
          session.accessToken,
          questionId as number
        );
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        toast.success('Question deleted successfully');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete question';
        toast.error(errorMessage);
        throw error;
      } finally {
        setDeleting(null);
      }
    },
    [session?.accessToken]
  );

  const saveQuestion = useCallback(
    async (question: Question) => {
      if (!session?.accessToken) {
        toast.error('Please sign in to save questions');
        return;
      }

      // Validate required fields
      if (!question.questionText.trim()) {
        toast.error('Question text is required');
        return;
      }

      if (question.quizId === null) {
        toast.error('Please select a quiz template');
        return;
      }

      // For question types that require answers, validate answers
      if (
        (question.type === 'single_choice' ||
          question.type === 'multi_choice') &&
        question.answers.length === 0
      ) {
        toast.error('Please add at least one answer choice');
        return;
      }

      // For single_choice, ensure exactly one correct answer
      if (question.type === 'single_choice') {
        const correctCount = question.answers.filter((a) => a.isCorrect).length;
        if (correctCount !== 1) {
          toast.error('Please select exactly one correct answer');
          return;
        }
      }

      // For yesno, ensure correct answer is selected
      if (question.type === 'yes_no' && !question.correctYesNoAnswer) {
        toast.error('Please select the correct answer for Yes/No question');
        return;
      }

      try {
        setSaving(question.id);
        const isUpdate = typeof question.id === 'number';
        const apiQuestion = questionToApi(question);

        let savedApiQuestion;
        if (isUpdate && typeof question.id === 'number') {
          // Use PATCH for partial updates
          savedApiQuestion = await QuestionService.patchQuestion(
            session.accessToken,
            question.id,
            apiQuestion
          );
        } else {
          // Create new question
          savedApiQuestion = await QuestionService.createQuestion(
            session.accessToken,
            apiQuestion
          );
        }

        // Convert back to local format and update state
        const savedQuestion = apiToQuestion(savedApiQuestion);
        const finalQuestion = { ...savedQuestion, isExpanded: false };

        setQuestions((prev) =>
          prev.map((q) => (q.id === question.id ? finalQuestion : q))
        );

        toast.success(
          typeof question.id === 'number'
            ? 'Question updated successfully'
            : 'Question saved successfully'
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to save question';
        toast.error(errorMessage);
      } finally {
        setSaving(null);
      }
    },
    [session?.accessToken]
  );

  const editQuestion = useCallback((question: Question) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...question, isExpanded: true } : q
      )
    );
  }, []);

  const cancelEdit = useCallback((question: Question) => {
    // Find the original saved version and restore it
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === question.id) {
          return { ...q, isExpanded: false };
        }
        return q;
      })
    );
  }, []);

  return {
    questions,
    loading,
    saving,
    deleting,
    addNewQuestion,
    updateQuestion,
    deleteQuestion,
    saveQuestion,
    editQuestion,
    cancelEdit,
    setQuestions
  };
}
