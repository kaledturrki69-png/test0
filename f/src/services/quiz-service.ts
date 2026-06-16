import {
  QuizTemplate,
  CreateQuizTemplatePayload,
  QuizLevel,
  QuizInstance,
  UpdateQuizInstancePayload
} from '@/types/quiz';

export class QuizService {
  /**
   * Get all quiz templates
   * @param accessToken - Authentication token
   * @param skillId - Optional skill ID to filter by
   * @param level - Optional level filter ('low' or 'expert')
   */
  static async getTemplates(
    accessToken: string,
    skillId?: number,
    level?: QuizLevel
  ): Promise<QuizTemplate[]> {
    const params = new URLSearchParams();
    if (skillId) {
      params.append('skill_id', skillId.toString());
    }
    if (level) {
      params.append('level', level);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `/api/assessment/templates${queryString}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch quiz templates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a specific quiz template by ID
   * @param accessToken - Authentication token
   * @param templateId - Template ID
   */
  static async getTemplate(
    accessToken: string,
    templateId: number
  ): Promise<QuizTemplate> {
    const response = await fetch(`/api/assessment/templates/${templateId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch quiz template: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new quiz template
   * @param accessToken - Authentication token
   * @param payload - Template data
   */
  static async createTemplate(
    accessToken: string,
    payload: CreateQuizTemplatePayload
  ): Promise<QuizTemplate> {
    const response = await fetch('/api/assessment/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `Failed to create quiz template: ${response.statusText}`;
      try {
        const error = await response.json();
        // Handle different error response formats
        if (error.detail) {
          errorMessage =
            typeof error.detail === 'string'
              ? error.detail
              : JSON.stringify(error.detail);
        } else if (error.error) {
          errorMessage =
            typeof error.error === 'string'
              ? error.error
              : JSON.stringify(error.error);
        } else if (error.message) {
          errorMessage =
            typeof error.message === 'string'
              ? error.message
              : JSON.stringify(error.message);
        } else if (typeof error === 'object') {
          // Try to extract validation errors
          const validationErrors = Object.entries(error)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${String(value)}`;
            })
            .join('; ');
          if (validationErrors) {
            errorMessage = validationErrors;
          }
        }
      } catch (parseError) {
        // If JSON parsing fails, try to get text
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch {
          // Use default error message
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Update a quiz instance (PUT)
   * @param accessToken - Authentication token
   * @param quizId - Quiz instance ID
   * @param payload - Update payload
   */
  static async updateQuiz(
    accessToken: string,
    quizId: number,
    payload: UpdateQuizInstancePayload
  ): Promise<QuizInstance> {
    const response = await fetch(`/api/assessment/quizzes/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `Failed to update quiz instance: ${response.statusText}`
      }));
      throw new Error(
        error.detail ||
          error.error ||
          error.message ||
          'Failed to update quiz instance'
      );
    }

    return response.json();
  }

  /**
   * Partially update a quiz instance (PATCH)
   * @param accessToken - Authentication token
   * @param quizId - Quiz instance ID
   * @param payload - Partial update payload
   */
  static async patchQuiz(
    accessToken: string,
    quizId: number,
    payload: Partial<UpdateQuizInstancePayload>
  ): Promise<QuizInstance> {
    const response = await fetch(`/api/assessment/quizzes/${quizId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `Failed to update quiz instance: ${response.statusText}`
      }));
      throw new Error(
        error.detail ||
          error.error ||
          error.message ||
          'Failed to update quiz instance'
      );
    }

    return response.json();
  }

  /**
   * Delete a quiz instance
   * @param accessToken - Authentication token
   * @param quizId - Quiz instance ID
   */
  static async deleteQuiz(accessToken: string, quizId: number): Promise<void> {
    const response = await fetch(`/api/assessment/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `Failed to delete quiz instance: ${response.statusText}`
      }));
      throw new Error(
        error.detail ||
          error.error ||
          error.message ||
          'Failed to delete quiz instance'
      );
    }

    // DELETE returns 204 No Content
    return;
  }

  /**
   * Complete a quiz instance
   * @param accessToken - Authentication token
   * @param quizId - Quiz instance ID
   * @param payload - Optional completion payload
   */
  static async completeQuiz(
    accessToken: string,
    quizId: number,
    payload?: UpdateQuizInstancePayload
  ): Promise<QuizInstance> {
    const response = await fetch(`/api/assessment/quizzes/${quizId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: payload ? JSON.stringify(payload) : undefined
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `Failed to complete quiz instance: ${response.statusText}`
      }));
      throw new Error(
        error.detail ||
          error.error ||
          error.message ||
          'Failed to complete quiz instance'
      );
    }

    return response.json();
  }

  /**
   * Update a quiz template (PUT)
   * @param accessToken - Authentication token
   * @param templateId - Template ID
   * @param payload - Update payload
   */
  static async updateTemplate(
    accessToken: string,
    templateId: number,
    payload: Partial<CreateQuizTemplatePayload>
  ): Promise<QuizTemplate> {
    const response = await fetch(`/api/assessment/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `Failed to update quiz template: ${response.statusText}`;
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage =
            typeof error.detail === 'string'
              ? error.detail
              : JSON.stringify(error.detail);
        } else if (error.error) {
          errorMessage =
            typeof error.error === 'string'
              ? error.error
              : JSON.stringify(error.error);
        } else if (error.message) {
          errorMessage =
            typeof error.message === 'string'
              ? error.message
              : JSON.stringify(error.message);
        } else if (typeof error === 'object') {
          const validationErrors = Object.entries(error)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${String(value)}`;
            })
            .join('; ');
          if (validationErrors) {
            errorMessage = validationErrors;
          }
        }
      } catch (parseError) {
        // Use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Partially update a quiz template (PATCH)
   * @param accessToken - Authentication token
   * @param templateId - Template ID
   * @param payload - Partial update payload
   */
  static async patchTemplate(
    accessToken: string,
    templateId: number,
    payload: Partial<CreateQuizTemplatePayload>
  ): Promise<QuizTemplate> {
    const response = await fetch(`/api/assessment/templates/${templateId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `Failed to update quiz template: ${response.statusText}`;
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage =
            typeof error.detail === 'string'
              ? error.detail
              : JSON.stringify(error.detail);
        } else if (error.error) {
          errorMessage =
            typeof error.error === 'string'
              ? error.error
              : JSON.stringify(error.error);
        } else if (error.message) {
          errorMessage =
            typeof error.message === 'string'
              ? error.message
              : JSON.stringify(error.message);
        }
      } catch (parseError) {
        // Use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Delete a quiz template
   * @param accessToken - Authentication token
   * @param templateId - Template ID
   */
  static async deleteTemplate(
    accessToken: string,
    templateId: number
  ): Promise<void> {
    const response = await fetch(`/api/assessment/templates/${templateId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `Failed to delete quiz template: ${response.statusText}`
      }));
      throw new Error(
        error.detail ||
          error.error ||
          error.message ||
          'Failed to delete quiz template'
      );
    }

    // DELETE returns 204 No Content
    return;
  }
}
