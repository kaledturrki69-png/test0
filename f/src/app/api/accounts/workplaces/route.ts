import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  fetchFromRemote,
  createErrorResponse,
  handleApiError
} from '@/lib/api-route-helpers';
import { API_ENDPOINTS } from '@/constants/api';

export async function GET() {
  try {
    const session = await requireAuth();

    const response = await fetchFromRemote(
      API_ENDPOINTS.WORKPLACES,
      session.accessToken
    );

    if (!response.ok) {
      return createErrorResponse(response);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const payload = await request.json();

    const response = await fetchFromRemote(
      API_ENDPOINTS.WORKPLACES,
      session.accessToken,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      return createErrorResponse(response);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
