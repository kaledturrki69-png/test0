import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CandidateWithDetails } from './use-candidate-matching';

interface ActionDialog {
  isOpen: boolean;
  action: string;
  candidateId?: number;
}

interface UseTableSelectionReturn {
  selectedRows: Set<number>;
  setSelectedRows: (rows: Set<number>) => void;
  actionDialog: ActionDialog;
  setActionDialog: (dialog: ActionDialog) => void;
  handleSelectAll: (
    checked: boolean,
    candidates: CandidateWithDetails[]
  ) => void;
  handleSelectRow: (id: string | number, checked: boolean) => void;
  handleAction: (action: string, candidateId?: number) => void;
  handleBulkAction: (action: string) => void;
  isAllSelected: (candidates: CandidateWithDetails[]) => boolean;
  isSomeSelected: (candidates: CandidateWithDetails[]) => boolean;
  getActionDialogTitle: () => string;
}

/**
 * Custom hook to manage table row selection and bulk actions
 */
export function useTableSelection(t: any): UseTableSelectionReturn {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [actionDialog, setActionDialog] = useState<ActionDialog>({
    isOpen: false,
    action: ''
  });

  const handleSelectAll = useCallback(
    (checked: boolean, candidates: CandidateWithDetails[]) => {
      if (checked) {
        const allIds = new Set(candidates.map((c) => c.candidate_id));
        setSelectedRows(allIds);
      } else {
        setSelectedRows(new Set());
      }
    },
    []
  );

  const handleSelectRow = useCallback(
    (id: string | number, checked: boolean) => {
      const newSelected = new Set(selectedRows);
      if (checked) {
        newSelected.add(id as number);
      } else {
        newSelected.delete(id as number);
      }
      setSelectedRows(newSelected);
    },
    [selectedRows]
  );

  const handleAction = useCallback((action: string, candidateId?: number) => {
    setActionDialog({
      isOpen: true,
      action,
      candidateId
    });
  }, []);

  const handleBulkAction = useCallback(
    (action: string) => {
      if (selectedRows.size === 0) {
        toast.warning(t('select_at_least_one'));
        return;
      }
      setActionDialog({
        isOpen: true,
        action: `bulk-${action}`,
        candidateId: undefined
      });
    },
    [selectedRows.size, t]
  );

  const isAllSelected = useCallback(
    (candidates: CandidateWithDetails[]) => {
      return (
        candidates.length > 0 &&
        candidates.every((c) => selectedRows.has(c.candidate_id))
      );
    },
    [selectedRows]
  );

  const isSomeSelected = useCallback(
    (candidates: CandidateWithDetails[]) => {
      return selectedRows.size > 0 && !isAllSelected(candidates);
    },
    [selectedRows.size, isAllSelected]
  );

  const getActionDialogTitle = useCallback(() => {
    switch (actionDialog.action) {
      case 'select-by-position':
        return t('select_by_position');
      case 'select-by-score':
        return t('select_by_score');
      case 'send-email':
        return t('send_email');
      case 'schedule-interview':
        return t('schedule_interview');
      case 'bulk-send-email':
        return t('bulk_send_email', { count: selectedRows.size });
      case 'bulk-schedule-interview':
        return t('bulk_schedule_interview', { count: selectedRows.size });
      default:
        return '';
    }
  }, [actionDialog.action, selectedRows.size, t]);

  return {
    selectedRows,
    setSelectedRows,
    actionDialog,
    setActionDialog,
    handleSelectAll,
    handleSelectRow,
    handleAction,
    handleBulkAction,
    isAllSelected,
    isSomeSelected,
    getActionDialogTitle
  };
}
