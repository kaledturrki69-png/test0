import { BaseService } from './base-service';
import { ApiQuestion } from '@/types/question';

export class QuestionService extends BaseService {
  // GET /api/assessment/questions - Get all questions
  static async getQuestions(accessToken: string): Promise<ApiQuestion[]> {
    return this.makeAuthenticatedRequest<ApiQuestion[]>(
      '/api/assessment/questions',
      accessToken,
      {
        method: 'GET'
      }
    );
  }

  // GET /api/assessment/questions/[id] - Get a specific question
  static async getQuestion(
    accessToken: string,
    id: number
  ): Promise<ApiQuestion> {
    return this.makeAuthenticatedRequest<ApiQuestion>(
      `/api/assessment/questions/${id}`,
      accessToken,
      {
        method: 'GET'
      }
    );
  }

  // POST /api/assessment/questions - Create a new question
  static async createQuestion(
    accessToken: string,
    question: Partial<ApiQuestion>
  ): Promise<ApiQuestion> {
    return this.makeAuthenticatedRequest<ApiQuestion>(
      '/api/assessment/questions',
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(question)
      }
    );
  }

  // PUT /api/assessment/questions/[id] - Update a question (full update)
  static async updateQuestion(
    accessToken: string,
    id: number,
    question: Partial<ApiQuestion>
  ): Promise<ApiQuestion> {
    return this.makeAuthenticatedRequest<ApiQuestion>(
      `/api/assessment/questions/${id}`,
      accessToken,
      {
        method: 'PUT',
        body: JSON.stringify(question)
      }
    );
  }

  // PATCH /api/assessment/questions/[id] - Partially update a question
  static async patchQuestion(
    accessToken: string,
    id: number,
    question: Partial<ApiQuestion>
  ): Promise<ApiQuestion> {
    return this.makeAuthenticatedRequest<ApiQuestion>(
      `/api/assessment/questions/${id}`,
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify(question)
      }
    );
  }

  // DELETE /api/assessment/questions/[id] - Delete a question
  static async deleteQuestion(accessToken: string, id: number): Promise<void> {
    await this.makeAuthenticatedRequest<void>(
      `/api/assessment/questions/${id}`,
      accessToken,
      {
        method: 'DELETE'
      }
    );
  }
}
