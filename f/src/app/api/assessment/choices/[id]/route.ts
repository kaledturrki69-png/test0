import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  fetchFromRemote,
  createErrorResponse,
  handleApiError
} from '@/lib/api-route-helpers';
import { API_ENDPOINTS } from '@/constants/api';

// GET /api/assessment/choices/[id] - Get a specific assessment question choice
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const response = await fetchFromRemote(
      API_ENDPOINTS.ASSESSMENT_CHOICE_DETAIL(id),
      session.accessToken
    );

    if (!response.ok) {
      return await createErrorResponse(response);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/assessment/choices/[id] - Update an assessment question choice (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    const response = await fetchFromRemote(
      API_ENDPOINTS.ASSESSMENT_CHOICE_DETAIL(id),
      session.accessToken,
      {
        method: 'PUT',
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

// PATCH /api/assessment/choices/[id] - Partially update an assessment question choice
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    const response = await fetchFromRemote(
      API_ENDPOINTS.ASSESSMENT_CHOICE_DETAIL(id),
      session.accessToken,
      {
        method: 'PATCH',
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

// DELETE /api/assessment/choices/[id] - Delete an assessment question choice
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const response = await fetchFromRemote(
      API_ENDPOINTS.ASSESSMENT_CHOICE_DETAIL(id),
      session.accessToken,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      return await createErrorResponse(response);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
