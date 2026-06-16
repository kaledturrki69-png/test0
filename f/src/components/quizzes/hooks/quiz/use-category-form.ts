import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { QuizCategory } from '@/types/quiz';

interface CategoryFormData {
  template: number;
  name: string;
  description: string;
  weight: number;
}

export function useCategoryForm(
  onCategoryCreated?: (category: QuizCategory) => void,
  onCategoryUpdated?: (category: QuizCategory) => void
) {
  const { data: session } = useSession();
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleCreate = useCallback(
    async (formData: CategoryFormData) => {
      if (!session?.accessToken) {
        toast.error('Please sign in to create a category');
        return;
      }

      if (!formData.name.trim()) {
        toast.error('Category name is required');
        return;
      }

      if (!formData.template || formData.template === 0) {
        toast.error('Template is required');
        return;
      }

      try {
        setCreating(true);

        const payload = {
          template: formData.template,
          name: formData.name,
          description: formData.description || '',
          weight: formData.weight || 0.1,
          translations: [] // Empty translations array as per API spec
        };

        const response = await fetch('/api/assessment/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          let error: any;
          try {
            error = await response.json();
          } catch {
            error = {
              error: `Failed to create category: ${response.statusText}`
            };
          }

          // Extract error message from various possible formats
          const errorMessage =
            error.error ||
            error.detail ||
            error.message ||
            (typeof error === 'string' ? error : 'Failed to create category');

          throw new Error(errorMessage);
        }

        const newCategory = await response.json();
        toast.success('Category created successfully');

        if (onCategoryCreated) {
          onCategoryCreated(newCategory);
        }

        return newCategory;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to create category'
        );
        throw error;
      } finally {
        setCreating(false);
      }
    },
    [session?.accessToken, onCategoryCreated]
  );

  const handleUpdate = useCallback(
    async (id: number, formData: CategoryFormData) => {
      if (!session?.accessToken) {
        toast.error('Please sign in to update a category');
        return;
      }

      if (!formData.name.trim()) {
        toast.error('Category name is required');
        return;
      }

      if (!formData.template || formData.template === 0) {
        toast.error('Template is required');
        return;
      }

      try {
        setUpdating(true);

        const payload = {
          template: formData.template,
          name: formData.name,
          description: formData.description || '',
          weight: formData.weight || 0.1,
          translations: [] // Empty translations array as per API spec
        };

        const response = await fetch(`/api/assessment/categories/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          let error: any;
          try {
            error = await response.json();
          } catch {
            error = {
              error: `Failed to update category: ${response.statusText}`
            };
          }

          const errorMessage =
            error.error ||
            error.detail ||
            error.message ||
            (typeof error === 'string' ? error : 'Failed to update category');

          throw new Error(errorMessage);
        }

        const updatedCategory = await response.json();
        toast.success('Category updated successfully');

        if (onCategoryUpdated) {
          onCategoryUpdated(updatedCategory);
        }

        return updatedCategory;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update category'
        );
        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [session?.accessToken, onCategoryUpdated]
  );

  return {
    creating,
    updating,
    handleCreate,
    handleUpdate
  };
}
