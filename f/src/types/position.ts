export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface SkillWeight {
  id: number;
  name: string;
  type: 'hard' | 'soft';
  weight: number;
}

export interface Condition {
  id: number;
  name: string;
}

export interface Library {
  id: number;
  name: string;
  description: string;
  category: Category;
  company_id: number;
  is_library: boolean;
}

export interface Position {
  id: number;
  company: number;
  user: number;
  category: Category;
  name: string;
  description: string;
  expected_hiring_date: string;
  number_to_hire: number;
  number_to_shortlist: number;
  status: 'open' | 'closed';
  is_library: boolean;
  workplace: number;
  workplace_name: string;
  workplace_address_line1?: string;
  hard_skills: SkillWeight[];
  soft_skills: SkillWeight[];
  conditions: Condition[];
  created_at: string;
  updated_at: string;
}

export interface PositionFormData {
  category_id: number;
  name: string;
  description: string;
  expected_hiring_date: string;
  number_to_hire: number;
  number_to_shortlist: number;
  status: 'open' | 'closed';
  is_library: boolean;
  workplace: number;
  hard_skill_ids: number[];
  soft_skill_ids: number[];
  condition_ids: number[];
}
