import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  MatchingService,
  MatchingCandidate
} from '@/services/matching-service';
import { CandidateService } from '@/services/candidate-service';
import { ResumeAPI } from '@/types/candidate-api';
import { extractUserCompany } from '../utils/recruiting-utils';

interface SelectedPosition {
  id: number;
  name: string;
}

export interface CandidateWithDetails extends MatchingCandidate {
  resume?: ResumeAPI;
}

interface UseCandidateMatchingReturn {
  candidates: CandidateWithDetails[];
  matchingLoading: boolean;
}

/**
 * Custom hook to manage candidate matching logic
 * Handles fetching, filtering, and enriching candidate data
 */
export function useCandidateMatching(
  selectedPosition: SelectedPosition | null,
  t: any
): UseCandidateMatchingReturn {
  const { data: session } = useSession();
  const [candidates, setCandidates] = useState<CandidateWithDetails[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  useEffect(() => {
    const fetchMatchingCandidates = async () => {
      if (!session?.accessToken || !selectedPosition) {
        setCandidates([]);
        return;
      }

      try {
        setMatchingLoading(true);

        const position = selectedPosition;

        try {
          const matchingResponse = await MatchingService.getMatchingCandidates(
            position.id,
            session.accessToken,
            { minScore: 0.1, limit: 50 }
          );

          const candidatesList =
            matchingResponse.resultss ||
            (matchingResponse as any).results ||
            [];

          // Get user's company from token
          const userCompany = extractUserCompany(session.accessToken);

          // Filter candidates by company (case-insensitive comparison)
          const companyFilteredCandidates = userCompany
            ? candidatesList.filter((c: MatchingCandidate) => {
                const candidateCompany = (c.resume_company || '')
                  .toLowerCase()
                  .trim();
                const userCompanyLower = userCompany.toLowerCase().trim();
                return candidateCompany === userCompanyLower;
              })
            : candidatesList;

          // Fetch all resumes once (more efficient than fetching for each candidate)
          let allResumes: ResumeAPI[] = [];
          try {
            allResumes = await CandidateService.getResumes(session.accessToken);
          } catch (error) {
            // Silent error handling
          }

          const enrichedCandidates = await Promise.all(
            companyFilteredCandidates.map(
              async (candidate: MatchingCandidate) => {
                try {
                  // Try to find resume in the fetched list first
                  let resume = allResumes.find(
                    (r) => r.id === candidate.resume_id
                  );

                  // If not found, try to fetch individual resume
                  if (!resume) {
                    try {
                      resume = await CandidateService.getResume(
                        candidate.resume_id,
                        session.accessToken
                      );
                    } catch (err) {
                      // Resume not accessible
                    }
                  }

                  return {
                    ...candidate,
                    resume
                  };
                } catch (error) {
                  return candidate;
                }
              }
            )
          );

          // Filter out candidates without accessible resumes
          const accessibleCandidates = enrichedCandidates.filter(
            (c: any) => c.resume !== undefined && c.resume !== null
          );

          // Show filtering summary
          const totalFiltered =
            candidatesList.length - accessibleCandidates.length;
          const companyFiltered =
            candidatesList.length - companyFilteredCandidates.length;
          const resumeInaccessible =
            companyFilteredCandidates.length - accessibleCandidates.length;

          if (totalFiltered > 0) {
            let message = '';
            if (companyFiltered > 0 && resumeInaccessible > 0) {
              message = t('filter_summary_both', {
                totalFiltered,
                companyFiltered,
                resumeInaccessible
              });
            } else if (companyFiltered > 0) {
              message = t('filter_summary_company', {
                companyFiltered
              });
            } else if (resumeInaccessible > 0) {
              message = t('filter_summary_resume', {
                resumeInaccessible
              });
            }

            if (message) {
              toast.warning(message);
            }
          }

          setCandidates(accessibleCandidates);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t('unknown_error');
          toast.error(
            t('failed_fetch_candidates', {
              position: position.name,
              error: errorMessage
            })
          );
          setCandidates([]);
        }
      } catch (error) {
        toast.error(t('failed_load_matching_candidates'));
      } finally {
        setMatchingLoading(false);
      }
    };

    fetchMatchingCandidates();
  }, [session?.accessToken, selectedPosition, t]);

  return {
    candidates,
    matchingLoading
  };
}
