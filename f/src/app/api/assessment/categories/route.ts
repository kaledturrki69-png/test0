import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  fetchFromRemote,
  createErrorResponse,
  handleApiError
} from '@/lib/api-route-helpers';
import { API_ENDPOINTS } from '@/constants/api';

// GET /api/assessment/categories - Get all quiz categories
// Supports filtering by template via ?template=<id> query param
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('template');

    // Build URL with optional template filter
    let url = API_ENDPOINTS.ASSESSMENT_CATEGORIES;
    if (templateId) {
      url += `?template=${templateId}`;
    }

    const response = await fetchFromRemote(url, session.accessToken);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([]);
      }
      return await createErrorResponse(response);
    }

    const data = await response.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    const errorResponse = handleApiError(error);
    // Return empty array for categories on error (graceful degradation)
    if (errorResponse.status === 401) {
      return errorResponse;
    }
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/assessment/categories - Create a new quiz category
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const response = await fetchFromRemote(
      API_ENDPOINTS.ASSESSMENT_CATEGORIES,
      session.accessToken,
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      return await createErrorResponse(response);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return handleApiError(error);
  }
}
