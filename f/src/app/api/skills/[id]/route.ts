import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  fetchFromRemote,
  createErrorResponse,
  handleApiError
} from '@/lib/api-route-helpers';
import { API_ENDPOINTS } from '@/constants/api';

// GET /api/skills/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const response = await fetchFromRemote(
      API_ENDPOINTS.SKILL_DETAIL(id),
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

// PUT /api/skills/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    const endpoint = API_ENDPOINTS.SKILL_DETAIL(id);
    const response = await fetchFromRemote(endpoint, session.accessToken, {
      method: 'PUT',
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      // Extract detailed error information
      const errorResponse = await createErrorResponse(response);
      // The error response already contains the detailed error from the remote API
      return errorResponse;
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/skills/[id]
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
      API_ENDPOINTS.SKILL_DETAIL(id),
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

// DELETE /api/skills/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const response = await fetchFromRemote(
      API_ENDPOINTS.SKILL_DETAIL(id),
      session.accessToken,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      return await createErrorResponse(response);
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json({ success: true }, { status: response.status });
  } catch (error) {
    return handleApiError(error);
  }
}
