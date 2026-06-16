export type SkillType = 'hard' | 'soft';

export interface Skill {
  id: number;
  name: string;
  type: SkillType;
  description: string;
}

export interface SkillFormData {
  name: string;
  type: SkillType;
  description: string;
}
