import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CandidateWithDetails } from './use-candidate-matching';

interface UseCandidateSelectionReturn {
  selectedCandidate: CandidateWithDetails | null;
  pdfUrl: string | null;
  loadingPdf: boolean;
  handleSelectCandidate: (candidate: CandidateWithDetails) => Promise<void>;
  setPdfUrl: (url: string | null) => void;
}

/**
 * Custom hook to manage candidate selection and PDF loading
 */
export function useCandidateSelection(t: any): UseCandidateSelectionReturn {
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateWithDetails | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleSelectCandidate = useCallback(
    async (candidate: CandidateWithDetails) => {
      setSelectedCandidate(candidate);

      // Fetch PDF for original CV tab
      if (candidate.resume?.document) {
        setLoadingPdf(true);
        try {
          const res = await fetch(
            `/api/documents/${candidate.resume.document}/download`
          );
          if (!res.ok) {
            throw new Error(`Failed to fetch PDF: ${res.status}`);
          }
          const blob = await res.blob();
          if (blob.size === 0) {
            throw new Error('Received an empty file from the server');
          }
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } catch (err) {
          toast.error(t('failed_load_original_cv'));
          setPdfUrl(null);
        } finally {
          setLoadingPdf(false);
        }
      }
    },
    [t]
  );

  return {
    selectedCandidate,
    pdfUrl,
    loadingPdf,
    handleSelectCandidate,
    setPdfUrl
  };
}
