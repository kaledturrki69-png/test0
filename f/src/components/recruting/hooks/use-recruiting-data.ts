import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Position } from '@/types/position';
import { MatchingService } from '@/services/matching-service';

interface SelectedPosition {
  id: number;
  name: string;
}

interface UseRecruitingDataReturn {
  selectedPosition: SelectedPosition | null;
  setSelectedPosition: (position: SelectedPosition | null) => void;
  availablePositions: Position[];
  loading: boolean;
  positionSearchQuery: string;
  setPositionSearchQuery: (query: string) => void;
}

/**
 * Custom hook to manage recruiting data (positions)
 * Handles fetching positions and URL-based position selection
 */
export function useRecruitingData(t: any): UseRecruitingDataReturn {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [selectedPosition, setSelectedPosition] =
    useState<SelectedPosition | null>(null);
  const [availablePositions, setAvailablePositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionSearchQuery, setPositionSearchQuery] = useState('');

  useEffect(() => {
    const fetchPositions = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const positionsData = await MatchingService.getPositions(
          session.accessToken
        );
        setAvailablePositions(positionsData);

        // Check if there's a positionId in the URL
        const positionIdParam = searchParams.get('positionId');
        if (positionIdParam) {
          const positionId = parseInt(positionIdParam);
          const position = positionsData.find((p) => p.id === positionId);
          if (position) {
            setSelectedPosition({ id: position.id, name: position.name });
          } else {
            setSelectedPosition(null);
          }
        } else {
          setSelectedPosition(null);
        }
      } catch (error) {
        toast.error(t('failed_load_positions'));
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [session?.accessToken, searchParams, t]);

  return {
    selectedPosition,
    setSelectedPosition,
    availablePositions,
    loading,
    positionSearchQuery,
    setPositionSearchQuery
  };
}
