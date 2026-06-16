/**
 * Question Types
 */

export type QuestionType =
  | 'yes_no'
  | 'single_choice'
  | 'multi_choice'
  | 'rating'
  | 'numeric'
  | 'text';

export type QuestionLanguageMode = 'FLEXIBLE' | 'FIXED';

export interface QuestionAnswer {
  id: string | number;
  text: string;
  isCorrect: boolean;
  weight?: number;
}

// API types matching the backend
export interface QuestionChoice {
  id?: number;
  text: string;
  is_correct: boolean;
  weight: number;
}

export interface Question {
  id: string | number;
  quizId: number | null;
  categoryId: number | null;
  type: QuestionType;
  difficulty?: number;
  languageMode: QuestionLanguageMode;
  questionText: string;
  answers: QuestionAnswer[];
  correctYesNoAnswer?: 'yes' | 'no' | null;
  timeLimit: number;
  timeUnit: 'seconds' | 'minutes' | 'hours';
  score: number;
  isExpanded: boolean;
  createdAt?: string; // ISO date string from API
  updatedAt?: string; // ISO date string from API
}

// API types matching the backend
export interface ApiQuestion {
  id?: number;
  template: number | null;
  category: number | null;
  category_name?: string;
  text: string;
  type:
    | 'yesno'
    | 'single_choice'
    | 'multi_choice'
    | 'rating'
    | 'numeric'
    | 'text';
  difficulty: number;
  expected_duration: number;
  max_score: number;
  is_active: boolean;
  order: number;
  expected_value?: string | null;
  choices: QuestionChoice[];
  translations?: Array<{
    id?: number;
    language_code: string;
    text: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'yes_no', label: 'Yes/No' },
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multi_choice', label: 'Multi Choice' },
  { value: 'rating', label: 'Rating (Stars)' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'text', label: 'Text' }
];

export const LANGUAGE_MODES: { value: QuestionLanguageMode; label: string }[] =
  [
    { value: 'FLEXIBLE', label: 'FLEXIBLE' },
    { value: 'FIXED', label: 'FIXED' }
  ];

/**
 * Check if question type requires answers
 */
export function requiresAnswers(type: QuestionType): boolean {
  return ['single_choice', 'multi_choice'].includes(type);
}
