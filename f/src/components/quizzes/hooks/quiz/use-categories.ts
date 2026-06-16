import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { QuizCategory } from '@/types/quiz';

export function useCategories(templateId?: number | null) {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Build URL with optional template filter
      let url = '/api/assessment/categories';
      if (templateId) {
        url += `?template=${templateId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, templateId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refreshCategories = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    refreshCategories
  };
}
