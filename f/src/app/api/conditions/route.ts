import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  fetchFromRemote,
  createErrorResponse,
  handleApiError
} from '@/lib/api-route-helpers';
import { API_ENDPOINTS } from '@/constants/api';

// GET /api/conditions - Get all conditions
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';

    const djangoParams = new URLSearchParams();
    djangoParams.set('page', page);
    djangoParams.set('page_size', limit);
    djangoParams.set('limit', limit);
    djangoParams.set('offset', String((parseInt(page) - 1) * parseInt(limit)));

    if (search) {
      djangoParams.set('search', search);
    }

    const endpoint = `${API_ENDPOINTS.CONDITIONS}?${djangoParams.toString()}`;
    const response = await fetchFromRemote(endpoint, session.accessToken);

    if (!response.ok) {
      if (response.status === 404) {
        const emptyResponse: any = {
          success: true,
          time: new Date().toISOString(),
          message: 'No conditions found',
          total_conditions: 0,
          offset: 0,
          limit: 10,
          conditions: []
        };
        return NextResponse.json(emptyResponse);
      }
      return createErrorResponse(response);
    }

    const data = await response.json();

    let responseData: any;
    if (Array.isArray(data)) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedData = data.slice(startIndex, endIndex);

      responseData = {
        success: true,
        time: new Date().toISOString(),
        message: 'Conditions fetched successfully (client-side pagination)',
        total_conditions: data.length,
        offset: startIndex,
        limit: limitNum,
        conditions: paginatedData
      };
    } else if (data.results && Array.isArray(data.results)) {
      responseData = {
        success: true,
        time: new Date().toISOString(),
        message: 'Conditions fetched successfully',
        total_conditions: data.count || data.results.length,
        offset: data.offset || 0,
        limit: data.limit || data.results.length,
        conditions: data.results
      };
    } else {
      responseData = data;
    }

    return NextResponse.json(responseData);
  } catch (error) {
    const errorResponse = handleApiError(error);
    // Return empty response for conditions on error (graceful degradation)
    if (errorResponse.status === 401) {
      return errorResponse;
    }
    const emptyResponse: any = {
      success: true,
      time: new Date().toISOString(),
      message: 'No conditions found - remote server unavailable',
      total_conditions: 0,
      offset: 0,
      limit: 10,
      conditions: []
    };
    return NextResponse.json(emptyResponse);
  }
}

// POST /api/conditions - Create a new condition
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const response = await fetchFromRemote(
      API_ENDPOINTS.CONDITIONS,
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
