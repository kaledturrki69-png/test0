import { useMemo } from 'react';
import { QuizTemplate } from '@/types/quiz';
import {
  matchesSkillFilter,
  matchesSearchFilter
} from '../../utils/quiz-utils';

interface UseQuizFiltersProps {
  templates: QuizTemplate[];
  selectedSkillId: number | 'all';
  searchTerm: string;
}

export function useQuizFilters({
  templates,
  selectedSkillId,
  searchTerm
}: UseQuizFiltersProps) {
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (!matchesSkillFilter(template, selectedSkillId)) return false;
      if (!matchesSearchFilter(template, searchTerm)) return false;
      return true;
    });
  }, [templates, selectedSkillId, searchTerm]);

  return { filteredTemplates };
}
