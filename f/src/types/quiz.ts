/**
 * Quiz Template Types
 */

export type LanguageMode = 'flexible' | 'fixed';
export type CategoryMixMode = 'uniform' | 'weighted' | 'custom';
export type DifficultyMixMode = 'uniform' | 'progressive' | 'custom';

export interface QuizCategoryTranslation {
  id: number;
  language_code: string;
  name: string;
  description: string;
}

export interface QuizCategory {
  id: number;
  name: string;
  description: string;
  weight: number;
  template?: number;
  translations: QuizCategoryTranslation[];
  created_at: string;
  updated_at: string;
}

export interface QuizTemplate {
  id: number;
  name: string;
  version: string;
  description: string;
  skill: number;
  skill_name: string;
  language_mode: LanguageMode;
  language_code: string;
  languages?: string[]; // Frontend-only: stores all selected languages for flexible mode
  category_mix_mode: CategoryMixMode;
  difficulty_mix_mode: DifficultyMixMode;
  default_question_count: number;
  is_library: boolean;
  is_published: boolean;
  categories: QuizCategory[];
  created_at: string;
  updated_at: string;
}

export interface CreateQuizTemplatePayload {
  name: string;
  version: string;
  description: string;
  purpose?: 'skill' | 'interview' | 'satisfaction' | 'other';
  skill?: number;
  language_mode?: LanguageMode;
  language_code?: string;
  category_mix_mode?: CategoryMixMode;
  difficulty_mix_mode?: DifficultyMixMode;
  default_question_count?: number;
  is_library?: boolean;
  is_published?: boolean;
  categories?: number[];
}

export type QuizLevel = 'low' | 'expert';

/**
 * Quiz Instance Types
 */
export type QuizLanguageMode = 'auto' | 'flexible' | 'fixed';

export interface QuizInstance {
  id: number;
  template: number;
  template_name: string;
  skill: number;
  skill_name: string;
  candidate: number;
  recruiter: number;
  language_mode: QuizLanguageMode;
  language_code: string;
  question_count: number;
  duration_seconds: number;
  is_completed: boolean;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateQuizInstancePayload {
  template?: number;
  skill?: number;
  candidate?: number;
  recruiter?: number;
  language_mode?: QuizLanguageMode;
  language_code?: string;
  question_count?: number;
  duration_seconds?: number;
  is_completed?: boolean;
  score?: number;
}
