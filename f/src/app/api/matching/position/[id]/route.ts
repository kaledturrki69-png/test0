import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  fetchFromRemote,
  createErrorResponse,
  handleApiError
} from '@/lib/api-route-helpers';
import { API_ENDPOINTS } from '@/constants/api';

// GET /api/matching/position/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const minScore = searchParams.get('min_score');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    // Build query string
    const queryParams = new URLSearchParams();
    if (minScore) queryParams.append('min_score', minScore);
    if (limit) queryParams.append('limit', limit);
    if (page) queryParams.append('page', page);

    const queryString = queryParams.toString();
    const endpoint = `${API_ENDPOINTS.MATCHING_POSITION(id)}${queryString ? `?${queryString}` : ''}`;
    const response = await fetchFromRemote(endpoint, session.accessToken);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          count: 0,
          page: 1,
          pages: 0,
          resultss: []
        });
      }
      return createErrorResponse(response);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorResponse = handleApiError(error);
    // Return empty response for matching on error (graceful degradation)
    if (errorResponse.status === 401) {
      return errorResponse;
    }
    return NextResponse.json(
      {
        count: 0,
        page: 1,
        pages: 0,
        resultss: []
      },
      { status: 200 }
    );
  }
}
