import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { QuizService } from '@/services/quiz-service';
import { QuizTemplate } from '@/types/quiz';

export function useQuizOperations(
  templates: QuizTemplate[],
  setTemplates: React.Dispatch<React.SetStateAction<QuizTemplate[]>>
) {
  const { data: session } = useSession();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: number | null;
    name: string;
  }>({ open: false, id: null, name: '' });

  const handleDelete = useCallback(
    async (id: number) => {
      if (!session?.accessToken) {
        toast.error('Please sign in to delete a quiz');
        return;
      }

      try {
        await QuizService.deleteTemplate(session.accessToken, id);
        setTemplates(templates.filter((t) => t.id !== id));
        setDeleteDialog({ open: false, id: null, name: '' });
        toast.success('Quiz template deleted successfully');
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to delete quiz template'
        );
      }
    },
    [session?.accessToken, templates, setTemplates]
  );

  const openDeleteDialog = useCallback((template: QuizTemplate) => {
    setDeleteDialog({
      open: true,
      id: template.id,
      name: template.name
    });
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, id: null, name: '' });
  }, []);

  return {
    deleteDialog,
    handleDelete,
    openDeleteDialog,
    closeDeleteDialog
  };
}
