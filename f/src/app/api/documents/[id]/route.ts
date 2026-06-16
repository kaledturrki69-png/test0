import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  fetchFromRemote,
  createErrorResponse,
  handleApiError
} from '@/lib/api-route-helpers';
import { API_ENDPOINTS } from '@/constants/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const response = await fetchFromRemote(
      API_ENDPOINTS.DOCUMENT_DETAIL(id),
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

// PUT /api/documents/[id] - Proxy update to remote server
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const response = await fetchFromRemote(
      API_ENDPOINTS.DOCUMENT_DETAIL(id),
      session.accessToken,
      {
        method: 'PUT',
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

// DELETE /api/documents/[id] - Proxy delete to remote server
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const response = await fetchFromRemote(
      API_ENDPOINTS.DOCUMENT_DETAIL(id),
      session.accessToken,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      return createErrorResponse(response);
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json({ success: true }, { status: response.status });
  } catch (error) {
    return handleApiError(error);
  }
}
