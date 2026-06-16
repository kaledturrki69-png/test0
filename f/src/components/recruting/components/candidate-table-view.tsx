'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTableView } from '@/components/views';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CandidateWithDetails } from '../hooks';
import { formatScore, getScoreBadgeStyle } from '../utils/recruiting-utils';
import { memo } from 'react';

interface CandidateTableViewProps {
  candidates: CandidateWithDetails[];
  currentPage: number;
  itemsPerPage: number;
  selectedRows: Set<number>;
  onPageChange: (page: number) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string | number, checked: boolean) => void;
  onViewCandidate: (candidate: CandidateWithDetails) => void;
  onAction: (action: string, candidateId?: number) => void;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}

export const CandidateTableView = memo(function CandidateTableView({
  candidates,
  currentPage,
  itemsPerPage,
  selectedRows,
  onPageChange,
  onSelectAll,
  onSelectRow,
  onViewCandidate,
  onAction,
  onBulkAction,
  onClearSelection
}: CandidateTableViewProps) {
  const t = useTranslations('recruitment');

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCandidates = candidates.slice(startIndex, endIndex);

  return (
    <DataTableView
      data={paginatedCandidates}
      getRowId={(candidate) => candidate.candidate_id}
      columns={[
        {
          key: 'full_name',
          header: t('full_name'),
          minWidth: 'min-w-[150px]',
          cellClassName: 'font-medium whitespace-nowrap',
          render: (candidate) =>
            `${candidate.first_name} ${candidate.last_name}`
        },
        {
          key: 'contact',
          header: t('contact'),
          minWidth: 'min-w-[200px]',
          render: (candidate) => (
            <div className='flex flex-col space-y-1'>
              <span className='truncate text-sm'>
                {candidate.email1 || t('no_email')}
              </span>
              <span className='text-muted-foreground text-xs whitespace-nowrap'>
                {candidate.phone1 || t('no_phone')}
              </span>
            </div>
          )
        },
        {
          key: 'position_name',
          header: t('position_name'),
          minWidth: 'min-w-[180px]',
          cellClassName: 'max-w-[250px] break-words whitespace-normal',
          render: (candidate) =>
            candidate.resume?.json_data?.title || t('no_position_value')
        },
        {
          key: 'score',
          header: t('score'),
          minWidth: 'min-w-[120px]',
          render: (candidate) => (
            <Badge
              className={`${getScoreBadgeStyle(candidate.score)} font-semibold`}
            >
              {formatScore(candidate.score)}%
            </Badge>
          )
        }
      ]}
      selection={{
        enabled: true,
        selectedIds: selectedRows,
        onSelectAll: onSelectAll,
        onSelectRow: onSelectRow,
        selectionMenuItems: [
          {
            label: t('deselect_all'),
            onClick: onClearSelection
          },
          {
            label: t('select_by_position'),
            onClick: () => onAction('select-by-position'),
            separator: true
          },
          {
            label: t('select_by_score'),
            onClick: () => onAction('select-by-score')
          }
        ],
        bulkActions: [
          {
            label: t('send_email_selected'),
            onClick: () => onBulkAction('send-email')
          },
          {
            label: t('schedule_interview_selected'),
            onClick: () => onBulkAction('schedule-interview')
          }
        ]
      }}
      selectionInfo={
        selectedRows.size > 0 ? (
          <div className='mb-4 flex items-center justify-between rounded-md border bg-blue-50 p-3'>
            <span className='text-sm font-medium text-blue-900'>
              {t('selected_candidate_count', {
                count: selectedRows.size
              })}
            </span>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClearSelection}
              className='text-blue-900 hover:text-blue-700'
            >
              {t('clear_selection')}
            </Button>
          </div>
        ) : undefined
      }
      actionColumn={{
        header: t('actions'),
        width: '120px',
        buttons: [
          {
            label: t('view'),
            icon: <Eye className='h-4 w-4' />,
            variant: 'outline',
            onClick: onViewCandidate
          }
        ],
        dropdownActions: [
          {
            label: t('send_email'),
            onClick: (candidate) =>
              onAction('send-email', candidate.candidate_id)
          },
          {
            label: t('schedule_interview'),
            onClick: (candidate) =>
              onAction('schedule-interview', candidate.candidate_id)
          }
        ]
      }}
      pagination={{
        currentPage,
        totalItems: candidates.length,
        itemsPerPage,
        onPageChange,
        showingText: t('pagination_info', {
          start: startIndex + 1,
          end: Math.min(endIndex, candidates.length),
          total: candidates.length
        }),
        previousText: t('previous'),
        nextText: t('next')
      }}
    />
  );
});
