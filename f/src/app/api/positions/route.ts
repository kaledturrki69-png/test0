import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  fetchFromRemote,
  createErrorResponse,
  handleApiError
} from '@/lib/api-route-helpers';
import { API_ENDPOINTS } from '@/constants/api';

// GET /api/positions - Get all positions
export async function GET() {
  try {
    const session = await requireAuth();

    const response = await fetchFromRemote(
      API_ENDPOINTS.POSITIONS,
      session.accessToken
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([]);
      }
      return createErrorResponse(response);
    }

    const data = await response.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    const errorResponse = handleApiError(error);
    // Return empty array for positions on error (graceful degradation)
    if (errorResponse.status === 401) {
      return errorResponse;
    }
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/positions - Create a new position
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const response = await fetchFromRemote(
      API_ENDPOINTS.POSITIONS,
      session.accessToken,
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      return createErrorResponse(response);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return handleApiError(error);
  }
}
