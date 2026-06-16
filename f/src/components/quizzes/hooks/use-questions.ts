import { useState, useCallback } from 'react';
import { Question } from '@/types/question';

const initialQuestion: Omit<Question, 'id'> = {
  quizId: null,
  categoryId: null,
  type: 'single_choice',
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
  const [questions, setQuestions] = useState<Question[]>([]);

  const addNewQuestion = useCallback(() => {
    const newQuestion: Question = {
      ...initialQuestion,
      id: `question-${Date.now()}`
    };
    setQuestions((prev) => [...prev, newQuestion]);
    return newQuestion;
  }, []);

  const updateQuestion = useCallback((updatedQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  }, []);

  const deleteQuestion = useCallback((questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }, []);

  const saveQuestion = useCallback((question: Question) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...question, isExpanded: false } : q
      )
    );
  }, []);

  const editQuestion = useCallback((question: Question) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...question, isExpanded: true } : q
      )
    );
  }, []);

  return {
    questions,
    addNewQuestion,
    updateQuestion,
    deleteQuestion,
    saveQuestion,
    editQuestion,
    setQuestions
  };
}
