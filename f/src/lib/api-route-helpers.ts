import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { API_BASE_URL } from '@/constants/api';
import { logger } from '@/lib/logger';

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

/**
 * Custom error class for API authentication failures
 */
export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Custom error class for API request failures
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Requires authentication and returns the session with access token
 * @throws {AuthenticationError} if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new AuthenticationError();
  }
  return session;
}

/**
 * Handles standard API errors and returns appropriate NextResponse
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (error instanceof ApiRequestError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    logger.error('API route error', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }

  logger.error('Unknown API error', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

/**
 * Handles error responses from remote API and extracts error body
 * Handles Django REST Framework validation errors with field-level details
 */
export async function extractErrorBody(
  response: Response
): Promise<ApiErrorResponse> {
  let errorBody: ApiErrorResponse;

  try {
    const json = await response.json();

    // Handle Django REST Framework validation errors
    // These often come in the format: { "field_name": ["error message"] }
    if (typeof json === 'object' && json !== null) {
      // Check if it's a DRF validation error format (field-level errors)
      const fieldErrors: string[] = [];
      const nonFieldErrors: string[] = [];

      for (const [key, value] of Object.entries(json)) {
        if (Array.isArray(value)) {
          const errorMessages = value.map((msg) => `${key}: ${msg}`).join(', ');
          if (
            key === 'non_field_errors' ||
            key === 'detail' ||
            key === 'error'
          ) {
            nonFieldErrors.push(errorMessages);
          } else {
            fieldErrors.push(errorMessages);
          }
        } else if (typeof value === 'string') {
          if (key === 'detail' || key === 'error' || key === 'message') {
            nonFieldErrors.push(value);
          } else {
            fieldErrors.push(`${key}: ${value}`);
          }
        }
      }

      // Combine all errors
      const allErrors = [...nonFieldErrors, ...fieldErrors];
      const errorMessage =
        allErrors.length > 0 ? allErrors.join('; ') : 'Request failed';

      errorBody = {
        error: errorMessage,
        details: json // Include full error object for debugging
      };
    } else {
      errorBody = { error: String(json) };
    }
  } catch {
    try {
      const text = await response.text();
      errorBody = { error: text || 'Request failed' };
    } catch {
      errorBody = { error: 'Request failed' };
    }
  }

  return errorBody;
}

/**
 * Creates a standardized error response for remote API failures
 */
export async function createErrorResponse(
  response: Response
): Promise<NextResponse<ApiErrorResponse>> {
  const errorBody = await extractErrorBody(response);

  // Handle specific status codes
  if (response.status === 401) {
    return NextResponse.json(
      errorBody.error ? errorBody : { error: 'Authentication token expired' },
      { status: 401 }
    );
  }

  if (response.status === 404) {
    return NextResponse.json(
      errorBody.error ? errorBody : { error: 'Resource not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(errorBody, { status: response.status });
}

/**
 * Fetches from remote API with authentication
 */
export async function fetchFromRemote(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  return response;
}

/**
 * Wrapper for API route handlers that require authentication
 * Automatically handles authentication and error handling
 */
export async function withAuth<T>(
  handler: (session: Awaited<ReturnType<typeof requireAuth>>) => Promise<T>
): Promise<T | NextResponse<ApiErrorResponse>> {
  try {
    const session = await requireAuth();
    return await handler(session);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Creates a safe API route handler that handles errors gracefully
 */
export function createApiHandler<T>(
  handler: (
    request: NextRequest,
    context?: any
  ) => Promise<NextResponse<T> | Response>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      const result = await handler(request, context);
      return result instanceof NextResponse
        ? result
        : NextResponse.json(result);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
