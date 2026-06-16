import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { QuizService } from '@/services/quiz-service';
import { QuizTemplate } from '@/types/quiz';
import { Skill } from '@/types/skill';

// Helper to derive languages from template data
const deriveLanguagesFromTemplate = (template: QuizTemplate): string[] => {
  // Check if we have stored languages in localStorage
  const storedLanguages = localStorage.getItem(
    `template_${template.id}_languages`
  );
  if (storedLanguages) {
    try {
      return JSON.parse(storedLanguages);
    } catch {
      // Fall through to derive from translations
    }
  }

  // For flexible mode, derive from category translations
  if (template.language_mode === 'flexible' && template.categories.length > 0) {
    const languageSet = new Set<string>();

    // Add the primary language
    languageSet.add(template.language_code);

    // Extract unique languages from category translations
    template.categories.forEach((category) => {
      category.translations.forEach((translation) => {
        languageSet.add(translation.language_code);
      });
    });

    return Array.from(languageSet);
  }

  // For fixed mode or no categories, just return the primary language
  return [template.language_code || 'en'];
};

export function useQuizData() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<QuizTemplate[]>([]);
  const [hardSkills, setHardSkills] = useState<Skill[]>([]);
  const [softSkills, setSoftSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [hardSkillsRes, softSkillsRes, templatesRes] = await Promise.all([
          fetch('/api/skills?type=hard', {
            headers: { Authorization: `Bearer ${session.accessToken}` }
          }),
          fetch('/api/skills?type=soft', {
            headers: { Authorization: `Bearer ${session.accessToken}` }
          }),
          QuizService.getTemplates(session.accessToken)
        ]);

        if (hardSkillsRes.ok) {
          const data = await hardSkillsRes.json();
          const hardSkillsOnly = Array.isArray(data)
            ? data.filter((skill: Skill) => skill.type === 'hard')
            : [];
          setHardSkills(hardSkillsOnly);
        }

        if (softSkillsRes.ok) {
          const data = await softSkillsRes.json();
          const softSkillsOnly = Array.isArray(data)
            ? data.filter((skill: Skill) => skill.type === 'soft')
            : [];
          setSoftSkills(softSkillsOnly);
        }

        // Enrich templates with languages array
        const enrichedTemplates = (templatesRes || []).map((template) => ({
          ...template,
          languages: deriveLanguagesFromTemplate(template)
        }));

        setTemplates(enrichedTemplates);
      } catch (error) {
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.accessToken]);

  return {
    templates,
    setTemplates,
    hardSkills,
    softSkills,
    loading
  };
}
