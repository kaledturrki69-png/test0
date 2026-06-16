'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Position } from '@/types/position';

// Import custom hooks
import {
  useRecruitingData,
  useCandidateMatching,
  useCandidateSelection,
  useTableSelection
} from '../../../../components/recruting/hooks';

// Import components
import {
  EmptyStates,
  RecruitingHeader,
  PositionSelectorModal,
  CandidateListSidebar,
  CandidateTableView,
  CandidateDetailTabs
} from '../../../../components/recruting/components';
import { usePageTitle } from '@/hooks/use-page-title';

export default function CondidatuersPage() {
  const t = useTranslations('recruitment');
  usePageTitle('Recruiting');

  // View and pagination state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const itemsPerPage = 10;

  // Custom hooks
  const {
    selectedPosition,
    setSelectedPosition,
    availablePositions,
    loading,
    positionSearchQuery,
    setPositionSearchQuery
  } = useRecruitingData(t);

  const { candidates, matchingLoading } = useCandidateMatching(
    selectedPosition,
    t
  );

  const {
    selectedCandidate,
    pdfUrl,
    loadingPdf,
    handleSelectCandidate,
    setPdfUrl
  } = useCandidateSelection(t);

  const {
    selectedRows,
    setSelectedRows,
    actionDialog,
    setActionDialog,
    handleSelectAll,
    handleSelectRow,
    handleAction,
    handleBulkAction,
    getActionDialogTitle
  } = useTableSelection(t);

  // Auto-select first candidate when candidates change
  useEffect(() => {
    if (candidates.length > 0 && !selectedCandidate) {
      handleSelectCandidate(candidates[0]);
    }
  }, [candidates, selectedCandidate, handleSelectCandidate]);

  // Reset to page 1 when position changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPosition]);

  // Position selection handlers
  const handleSelectPositionFromModal = (position: Position) => {
    if (selectedPosition?.id === position.id) {
      setSelectedPosition(null);
      setPdfUrl(null);
    } else {
      setSelectedPosition({ id: position.id, name: position.name });
      setShowPositionModal(false);
    }
  };

  const handleSelectPositionFromSearch = (position: Position) => {
    setSelectedPosition({ id: position.id, name: position.name });
  };

  // Table view handlers
  const handleViewCandidateFromTable = (candidate: any) => {
    setViewMode('grid');
    handleSelectCandidate(candidate);
  };

  const handleSelectAllRows = (checked: boolean) => {
    handleSelectAll(checked, candidates);
  };

  // Loading state
  if (loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <span className='ml-2'>{t('loading_positions')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen flex-col'>
      <div className='flex flex-1 flex-col overflow-hidden'>
        <div className='flex-1 overflow-y-auto pb-4'>
          <div className='container mx-auto space-y-6 p-6'>
            {/* Header */}
            <RecruitingHeader
              selectedPosition={selectedPosition}
              candidatesCount={candidates.length}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onOpenPositionModal={() => setShowPositionModal(true)}
              positionSearchQuery={positionSearchQuery}
              setPositionSearchQuery={setPositionSearchQuery}
              availablePositions={availablePositions}
              onSelectPosition={handleSelectPositionFromSearch}
            />

            {/* Main Content */}
            <div className='space-y-4'>
              {!selectedPosition ? (
                <EmptyStates type='no-position' />
              ) : matchingLoading ? (
                <EmptyStates type='loading' />
              ) : candidates.length === 0 ? (
                <EmptyStates type='no-candidates' />
              ) : viewMode === 'table' ? (
                <CandidateTableView
                  candidates={candidates}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  selectedRows={selectedRows}
                  onPageChange={setCurrentPage}
                  onSelectAll={handleSelectAllRows}
                  onSelectRow={handleSelectRow}
                  onViewCandidate={handleViewCandidateFromTable}
                  onAction={handleAction}
                  onBulkAction={handleBulkAction}
                  onClearSelection={() => setSelectedRows(new Set())}
                />
              ) : (
                <div className='grid grid-cols-12 gap-4'>
                  {/* Left Side - Candidate Cards */}
                  <div className='col-span-3'>
                    <CandidateListSidebar
                      candidates={candidates}
                      selectedCandidate={selectedCandidate}
                      onSelectCandidate={handleSelectCandidate}
                    />
                  </div>

                  {/* Right Side - Tabs */}
                  <div className='col-span-9'>
                    {!selectedCandidate ? (
                      <EmptyStates type='no-candidate-selected' />
                    ) : (
                      <CandidateDetailTabs
                        selectedCandidate={selectedCandidate}
                        pdfUrl={pdfUrl}
                        loadingPdf={loadingPdf}
                        onClosePdf={() => setPdfUrl(null)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Position Selection Modal */}
            <PositionSelectorModal
              open={showPositionModal}
              onOpenChange={setShowPositionModal}
              availablePositions={availablePositions}
              selectedPosition={selectedPosition}
              onSelectPosition={handleSelectPositionFromModal}
            />

            {/* Action Dialog for Table Actions */}
            <Dialog
              open={actionDialog.isOpen}
              onOpenChange={(open) =>
                setActionDialog({ isOpen: open, action: '' })
              }
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{getActionDialogTitle()}</DialogTitle>
                </DialogHeader>
                <div className='text-muted-foreground py-8 text-center'>
                  {actionDialog.action?.startsWith('bulk-') ? (
                    <div>
                      <p className='mb-2 font-medium'>
                        {t('bulk_selected_count', {
                          count: selectedRows.size
                        })}
                      </p>
                      <p>{t('feature_soon')}</p>
                    </div>
                  ) : getActionDialogTitle() ? (
                    <p>{t('feature_soon')}</p>
                  ) : null}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
