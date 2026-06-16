import { NextResponse } from 'next/server';
import {
  requireAuth,
  fetchFromRemote,
  createErrorResponse,
  handleApiError
} from '@/lib/api-route-helpers';
import { API_ENDPOINTS } from '@/constants/api';

// GET /api/libraries - Get all libraries
export async function GET() {
  try {
    const session = await requireAuth();

    const response = await fetchFromRemote(
      API_ENDPOINTS.LIBRARIES,
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
    // Return empty array for libraries on error (graceful degradation)
    if (errorResponse.status === 401) {
      return errorResponse;
    }
    return NextResponse.json([], { status: 200 });
  }
}
