import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { QuizTemplate, QuizLevel } from '@/types/quiz';
import { Skill } from '@/types/skill';

/**
 * Get skill name by ID from combined skills array
 */
export function getSkillName(
  skillId: number,
  hardSkills: Skill[],
  softSkills: Skill[]
): string {
  const allSkills = [...hardSkills, ...softSkills];
  const skill = allSkills.find((s) => s.id === skillId);
  return skill?.name || `Skill #${skillId}`;
}

/**
 * Get level badge component for a template
 */
export function getLevelBadge(template: QuizTemplate): React.ReactElement {
  const isLowLevel =
    template.difficulty_mix_mode === 'uniform' || !template.difficulty_mix_mode;

  return (
    <Badge variant={isLowLevel ? 'default' : 'destructive'}>
      {isLowLevel ? 'Low Level' : 'Expert Level'}
    </Badge>
  );
}

/**
 * Determine quiz level from difficulty_mix_mode
 */
export function getQuizLevel(template: QuizTemplate): QuizLevel {
  const isLowLevel =
    template.difficulty_mix_mode === 'uniform' || !template.difficulty_mix_mode;
  return isLowLevel ? 'low' : 'expert';
}

/**
 * Get skill type from template skill ID
 */
export function getSkillType(
  skillId: number,
  hardSkills: Skill[],
  softSkills: Skill[]
): 'hard' | 'soft' {
  const skill = [...hardSkills, ...softSkills].find((s) => s.id === skillId);
  return (
    skill?.type || (hardSkills.find((s) => s.id === skillId) ? 'hard' : 'soft')
  );
}

/**
 * Check if template matches level filter
 */
export function matchesLevelFilter(
  template: QuizTemplate,
  level: QuizLevel | 'all'
): boolean {
  if (level === 'all') return true;

  const isLowLevel =
    template.difficulty_mix_mode === 'uniform' || !template.difficulty_mix_mode;
  const isExpertLevel =
    template.difficulty_mix_mode === 'progressive' ||
    template.difficulty_mix_mode === 'custom';

  if (level === 'low' && !isLowLevel) return false;
  if (level === 'expert' && !isExpertLevel) return false;

  return true;
}

/**
 * Check if template matches skill filter
 */
export function matchesSkillFilter(
  template: QuizTemplate,
  skillId: number | 'all'
): boolean {
  if (skillId === 'all') return true;
  return template.skill === skillId;
}

/**
 * Check if template matches search filter
 */
export function matchesSearchFilter(
  template: QuizTemplate,
  searchTerm: string
): boolean {
  if (!searchTerm) return true;

  const searchLower = searchTerm.toLowerCase();
  return (
    template.name.toLowerCase().includes(searchLower) ||
    template.description.toLowerCase().includes(searchLower) ||
    template.skill_name.toLowerCase().includes(searchLower)
  );
}
