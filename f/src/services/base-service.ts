import { API_BASE_URL } from '@/constants/api';

export abstract class BaseService {
  protected static readonly API_URL = API_BASE_URL;

  /**
   * Makes a request to the API
   * @param endpoint - API endpoint
   *   - If absolute URL (starts with http), use as-is
   *   - If Next.js API route (starts with /api/), use as relative URL
   *   - Otherwise, prefix with API_URL for remote API calls
   * @param options - Fetch options
   * @returns Promise with parsed JSON response
   * @throws {Error} If request fails or response is not ok
   */
  protected static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let url: string;
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else if (
      endpoint.startsWith('/api/') &&
      !endpoint.startsWith('/api/v1/')
    ) {
      url = endpoint;
    } else {
      url = `${this.API_URL}${endpoint}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.detail ||
          errorData.error ||
          errorData.message ||
          (typeof errorData === 'string'
            ? errorData
            : JSON.stringify(errorData)) ||
          errorMessage;
      } catch (parseError) {
        // If we can't parse the error, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // Keep default error message
        }
      }
      throw new Error(errorMessage);
    }

    // For 204 No Content responses, return undefined instead of trying to parse JSON
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * Makes an authenticated request to the API
   * @param endpoint - API endpoint
   * @param accessToken - Bearer token for authentication
   * @param options - Additional fetch options
   * @returns Promise with parsed JSON response
   */
  protected static async makeAuthenticatedRequest<T>(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...options.headers
      }
    });
  }
}
