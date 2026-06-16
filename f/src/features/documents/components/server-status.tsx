'use client';

// Removed unused imports
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function ServerStatus() {
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(
    null
  );
  const { data: session } = useSession();

  useEffect(() => {
    const checkServerStatus = async () => {
      // Don't check if no session
      if (!session?.accessToken) {
        setIsServerAvailable(false);
        return;
      }

      try {
        const response = await fetch('/api/documents?page=1&limit=1', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        });
        const data = await response.json();

        // Check if we got a real response or a fallback message
        const isFallback =
          data.message?.includes('remote server') ||
          data.message?.includes('server unavailable') ||
          data.message?.includes('endpoint not available') ||
          data.message?.includes('token expired');

        setIsServerAvailable(!isFallback);
      } catch (error) {
        setIsServerAvailable(false);
      }
    };

    checkServerStatus();
  }, [session]);

  if (isServerAvailable === null) {
    return null; // Don't show anything while checking
  }

  if (isServerAvailable) {
    return null; // Server is available, no need to show anything
  }

  return null; // Server is not available, but we're not showing the alert for now
}
