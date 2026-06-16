import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { QuizService } from '@/services/quiz-service';
import { QuizTemplate, CreateQuizTemplatePayload } from '@/types/quiz';
import { Skill } from '@/types/skill';
import { getSkillType } from '../../utils/quiz-utils';

export interface QuizFormData {
  name: string;
  version: string;
  description: string;
  objectif: 'skill' | 'interview' | 'satisfaction' | 'other';
  skillType: 'hard' | 'soft' | '';
  skill: number;
  default_question_count: number;
  categories: number[];
  languageMode: 'single' | 'multi';
  languages: string[];
}

const initialFormData: QuizFormData = {
  name: '',
  version: 'v1',
  description: '',
  objectif: 'skill',
  skillType: '',
  skill: 0,
  default_question_count: 10,
  categories: [],
  languageMode: 'single',
  languages: ['en']
};

export function useQuizForm(
  hardSkills: Skill[],
  softSkills: Skill[],
  templates: QuizTemplate[],
  setTemplates: React.Dispatch<React.SetStateAction<QuizTemplate[]>>
) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<QuizFormData>(initialFormData);
  const [editingTemplate, setEditingTemplate] = useState<QuizTemplate | null>(
    null
  );
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditingTemplate(null);
  }, []);

  const handleEdit = useCallback(
    (template: QuizTemplate) => {
      const skillType = getSkillType(template.skill, hardSkills, softSkills);

      setEditingTemplate(template);
      setFormData({
        name: template.name,
        version: template.version,
        description: template.description || '',
        objectif: 'skill',
        skillType,
        skill: template.skill,
        default_question_count: template.default_question_count,
        categories: template.categories?.map((cat) => cat.id) || [],
        languageMode: template.language_mode === 'fixed' ? 'single' : 'multi',
        languages: template.languages || [template.language_code || 'en']
      });
    },
    [hardSkills, softSkills]
  );

  const handleCreate = useCallback(async () => {
    if (!session?.accessToken) {
      toast.error('Please sign in to create a quiz');
      return;
    }

    if (!formData.name) {
      toast.error('Please provide a template name');
      return;
    }

    try {
      setCreating(true);

      const payload: CreateQuizTemplatePayload = {
        name: formData.name,
        version: formData.version || 'v1',
        description: formData.description,
        purpose: formData.objectif || undefined,
        difficulty_mix_mode: 'uniform',
        category_mix_mode: 'uniform',
        language_mode:
          formData.languageMode === 'single' ? 'fixed' : 'flexible',
        language_code:
          formData.languageMode === 'single'
            ? formData.languages[0] || 'en'
            : 'en',
        default_question_count: formData.default_question_count || 10,
        is_library: false,
        is_published: false
      };

      if (formData.objectif === 'skill' && formData.skill > 0) {
        payload.skill = formData.skill;
      }

      const newTemplate = await QuizService.createTemplate(
        session.accessToken,
        payload
      );

      // Add languages field for frontend use and store in localStorage
      const selectedLanguages =
        formData.languageMode === 'multi'
          ? formData.languages
          : [formData.languages[0] || 'en'];
      const templateWithLanguages = {
        ...newTemplate,
        languages: selectedLanguages
      };

      // Persist selected languages to localStorage for multi-language templates
      if (formData.languageMode === 'multi' && selectedLanguages.length > 1) {
        localStorage.setItem(
          `template_${newTemplate.id}_languages`,
          JSON.stringify(selectedLanguages)
        );
      }

      setTemplates([...templates, templateWithLanguages]);
      resetForm();
      toast.success('Quiz template created successfully');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create quiz template'
      );
    } finally {
      setCreating(false);
    }
  }, [session?.accessToken, formData, templates, setTemplates, resetForm]);

  const handleUpdate = useCallback(async () => {
    if (!session?.accessToken || !editingTemplate) {
      toast.error('Please sign in to update a quiz');
      return;
    }

    if (!formData.name) {
      toast.error('Please provide a template name');
      return;
    }

    try {
      setUpdating(true);

      const languageCode =
        formData.languageMode === 'single'
          ? formData.languages[0] || 'en'
          : // For multi, prefer a selected primary language if provided, else keep existing, else 'en'
            formData.languages[0] || editingTemplate.language_code || 'en';

      const payload: CreateQuizTemplatePayload = {
        name: formData.name,
        version: formData.version,
        description: formData.description,
        purpose: formData.objectif || undefined,
        difficulty_mix_mode: 'uniform',
        category_mix_mode: 'uniform',
        language_mode:
          formData.languageMode === 'single' ? 'fixed' : 'flexible',
        language_code: languageCode,
        default_question_count: formData.default_question_count,
        is_library: editingTemplate.is_library,
        is_published: editingTemplate.is_published,
        categories:
          formData.categories.length > 0 ? formData.categories : undefined
      };

      if (formData.objectif === 'skill' && formData.skill > 0) {
        payload.skill = formData.skill;
      }

      const updatedTemplate = await QuizService.patchTemplate(
        session.accessToken,
        editingTemplate.id,
        payload
      );

      // Add languages field for frontend use and store in localStorage
      const selectedLanguages =
        formData.languageMode === 'multi'
          ? formData.languages
          : [formData.languages[0] || 'en'];
      const templateWithLanguages = {
        ...updatedTemplate,
        languages: selectedLanguages
      };

      // Persist selected languages to localStorage for multi-language templates
      if (formData.languageMode === 'multi' && selectedLanguages.length > 1) {
        localStorage.setItem(
          `template_${editingTemplate.id}_languages`,
          JSON.stringify(selectedLanguages)
        );
      } else {
        // Remove from localStorage if switching back to single language
        localStorage.removeItem(`template_${editingTemplate.id}_languages`);
      }

      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id ? templateWithLanguages : t
        )
      );

      resetForm();
      toast.success('Quiz template updated successfully');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update quiz template'
      );
    } finally {
      setUpdating(false);
    }
  }, [
    session?.accessToken,
    editingTemplate,
    formData,
    templates,
    setTemplates,
    resetForm
  ]);

  return {
    formData,
    setFormData,
    editingTemplate,
    creating,
    updating,
    handleEdit,
    handleCreate,
    handleUpdate,
    resetForm
  };
}
