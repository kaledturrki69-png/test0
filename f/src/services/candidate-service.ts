import {
  CandidateAPI,
  CandidateCreateRequest,
  CandidateUpdateRequest,
  ResumeAPI,
  ResumeCreateRequest,
  ResumeUpdateRequest
} from '@/types/candidate-api';
import { BaseService } from './base-service';
import { API_ENDPOINTS } from '@/constants/api';

export class CandidateService extends BaseService {
  // Candidates API
  static async getCandidates(accessToken: string): Promise<CandidateAPI[]> {
    return this.makeAuthenticatedRequest<CandidateAPI[]>(
      API_ENDPOINTS.CANDIDATES,
      accessToken
    );
  }

  static async getCandidate(
    id: number,
    accessToken: string
  ): Promise<CandidateAPI> {
    return this.makeAuthenticatedRequest<CandidateAPI>(
      API_ENDPOINTS.CANDIDATE_DETAIL(id),
      accessToken
    );
  }

  static async createCandidate(
    candidate: CandidateCreateRequest,
    accessToken: string
  ): Promise<CandidateAPI> {
    return this.makeAuthenticatedRequest<CandidateAPI>(
      API_ENDPOINTS.CANDIDATES,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(candidate)
      }
    );
  }

  static async updateCandidate(
    id: number,
    candidate: CandidateUpdateRequest,
    accessToken: string
  ): Promise<CandidateAPI> {
    return this.makeAuthenticatedRequest<CandidateAPI>(
      API_ENDPOINTS.CANDIDATE_DETAIL(id),
      accessToken,
      {
        method: 'PUT',
        body: JSON.stringify(candidate)
      }
    );
  }

  static async patchCandidate(
    id: number,
    candidate: CandidateUpdateRequest,
    accessToken: string
  ): Promise<CandidateAPI> {
    return this.makeAuthenticatedRequest<CandidateAPI>(
      API_ENDPOINTS.CANDIDATE_DETAIL(id),
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify(candidate)
      }
    );
  }

  // Resumes API
  static async getResumes(accessToken: string): Promise<ResumeAPI[]> {
    return this.makeAuthenticatedRequest<ResumeAPI[]>(
      API_ENDPOINTS.RESUMES,
      accessToken
    );
  }

  static async getResume(id: number, accessToken: string): Promise<ResumeAPI> {
    return this.makeAuthenticatedRequest<ResumeAPI>(
      API_ENDPOINTS.RESUME_DETAIL(id),
      accessToken
    );
  }

  static async createResume(
    resume: ResumeCreateRequest,
    accessToken: string
  ): Promise<ResumeAPI> {
    return this.makeAuthenticatedRequest<ResumeAPI>(
      API_ENDPOINTS.RESUMES,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(resume)
      }
    );
  }

  static async updateResume(
    id: number,
    resume: ResumeUpdateRequest,
    accessToken: string
  ): Promise<ResumeAPI> {
    return this.makeAuthenticatedRequest<ResumeAPI>(
      API_ENDPOINTS.RESUME_DETAIL(id),
      accessToken,
      {
        method: 'PUT',
        body: JSON.stringify(resume)
      }
    );
  }

  static async patchResume(
    id: number,
    resume: ResumeUpdateRequest,
    accessToken: string
  ): Promise<ResumeAPI> {
    return this.makeAuthenticatedRequest<ResumeAPI>(
      API_ENDPOINTS.RESUME_DETAIL(id),
      accessToken,
      {
        method: 'PATCH',
        body: JSON.stringify(resume)
      }
    );
  }

  // Helper methods
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
