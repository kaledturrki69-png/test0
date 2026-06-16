/**
 * Generic CRUD System Types
 * Shared across all CRUD pages (Skills, Conditions, etc.)
 */

export type FieldType = 'input' | 'textarea' | 'select' | 'number';

export interface FieldConfig {
  key: string;
  type: FieldType;
  placeholder: string;
  required?: boolean;
  options?: { label: string; value: string }[]; // For select fields
}

export interface ColumnConfig<T = any> {
  key: string;
  header: string;
  cellClassName?: string;
  minWidth?: string;
  render?: (item: T) => React.ReactNode;
}

export interface CrudPageConfig<T = any> {
  // Page metadata
  title: string;
  subtitle: string;
  translations?: string; // Translation namespace key

  // API configuration
  apiEndpoint: string;
  additionalParams?: Record<string, any>; // e.g., { type: 'hard' }
  additionalPayloadFields?: Record<string, any>; // e.g., { type: 'soft' }
  responseKey?: string; // For APIs that return { conditions: [...] }

  // Form configuration
  fields: FieldConfig[];

  // Table configuration
  tableColumns: ColumnConfig<T>[];

  // Labels (optional - will use translations or fallback)
  labels?: {
    add?: string; // "Add Skill", "Add Condition", etc.
    edit?: string; // "Edit Skill", "Edit Condition", etc.
    view?: string; // "View Skill", "View Condition", etc.
    delete?: string; // "Delete Skill", etc.
    viewLabel?: string; // "View:" label for toggle
    loading?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    actions?: string;
    submit?: string;
    update?: string;
    close?: string;
    previous?: string;
    next?: string;
    showing?: string; // Template: "Showing {start} to {end} of {total}"
  };

  // Custom rendering (optional)
  renderGridItem?: (
    item: T,
    onEdit: () => void,
    onDelete: () => void
  ) => React.ReactNode;

  // Validation (optional)
  validateForm?: (formData: Record<string, any>) => string | null; // Return error message or null
}

export interface CrudItem {
  id: number;
  [key: string]: any;
}

export interface DeleteDialogState {
  isOpen: boolean;
  itemId: number | null;
  itemName: string;
}

export interface FormState {
  [key: string]: string | number;
}
