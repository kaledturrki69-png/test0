import { Position } from '@/types/position';
import { BaseService } from './base-service';

export interface MatchingCandidate {
  resume_id: number;
  candidate_id: number;
  first_name: string;
  last_name: string;
  phone1: string;
  email1: string;
  location: string;
  resume_company: string;
  score: number;
  cached_at: string;
}

export interface MatchingResponse {
  count: number;
  page: number;
  pages: number;
  resultss: MatchingCandidate[]; // Note: API returns 'resultss' with double 's'
}

export class MatchingService extends BaseService {
  // Note: This service calls Next.js API routes (not remote API directly)

  // Get matching candidates for a position
  static async getMatchingCandidates(
    positionId: number,
    accessToken: string,
    options: {
      minScore?: number;
      limit?: number;
      page?: number;
    } = {}
  ): Promise<MatchingResponse> {
    const params = new URLSearchParams();

    if (options.minScore !== undefined) {
      params.append('min_score', options.minScore.toString());
    }
    if (options.limit !== undefined) {
      params.append('limit', options.limit.toString());
    }
    if (options.page !== undefined) {
      params.append('page', options.page.toString());
    }

    const queryString = params.toString();
    const endpoint = `/api/matching/position/${positionId}${queryString ? `?${queryString}` : ''}`;

    return this.makeAuthenticatedRequest<MatchingResponse>(
      endpoint,
      accessToken
    );
  }

  // Get all positions for selection
  // Note: This calls Next.js API route, not remote API
  static async getPositions(accessToken: string): Promise<Position[]> {
    return this.makeAuthenticatedRequest<Position[]>(
      '/api/positions',
      accessToken
    );
  }
}
