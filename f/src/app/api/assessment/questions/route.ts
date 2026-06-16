import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  fetchFromRemote,
  createErrorResponse,
  handleApiError
} from '@/lib/api-route-helpers';
import { API_ENDPOINTS } from '@/constants/api';

// GET /api/assessment/questions - Get all questions
export async function GET() {
  try {
    const session = await requireAuth();

    const response = await fetchFromRemote(
      API_ENDPOINTS.ASSESSMENT_QUESTIONS,
      session.accessToken
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([]);
      }
      return await createErrorResponse(response);
    }

    const data = await response.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/assessment/questions - Create a new question
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
      API_ENDPOINTS.ASSESSMENT_QUESTIONS,
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
