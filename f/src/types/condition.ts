export interface Condition {
  id: number;
  name: string;
  description: string;
  formula: string;
}

export interface ConditionFormData {
  name: string;
  description: string;
  formula: string;
}
