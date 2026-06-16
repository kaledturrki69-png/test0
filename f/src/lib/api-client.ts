import axios from 'axios';
import { getSession } from 'next-auth/react';

// Removed unused variable
const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function cleanHost(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return 'localhost';
  }
}

const apiClient = axios.create({
  baseURL: apiBase,

  headers: {
    Host: cleanHost(apiBase as string),
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session && (session as any).accessToken) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/auth/sign-in';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
