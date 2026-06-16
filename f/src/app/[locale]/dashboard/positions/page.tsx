'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconPlus } from '@tabler/icons-react';
import { Grid3X3, List } from 'lucide-react';
import { Position, Library } from '@/types/position';
import { LibrarySelectionModal } from '@/components/library-selection-modal';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { DataTableView } from '@/components/views';
import { IconEye, IconEdit, IconArchive } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';
import { usePageTitle } from '@/hooks/use-page-title';

// Import new components and hooks
import {
  PositionForm,
  PositionGridView
} from '../../../../components/positions/components';
import {
  useReferenceData,
  usePositionCRUD,
  PositionFormData
} from '../../../../components/positions/hooks';

export default function JobFilePage() {
  const t = useTranslations('jobfile');
  const { data: session } = useSession();
  usePageTitle('Positions');

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>(
    'create'
  );
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  // Library selection
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    positionId: number | null;
    positionName: string;
  }>({
    isOpen: false,
    positionId: null,
    positionName: ''
  });

  // Custom hooks
  const referenceData = useReferenceData();
  const crud = usePositionCRUD(
    (action) => {
      // Success callback
      if (action === 'create') toast.success(t('created'));
      if (action === 'update') toast.success(t('updated'));
      if (action === 'delete') toast.success(t('deleted'));
    },
    (action, error) => {
      // Error callback
      logger.error(`Failed to ${action} position`, error);
      if (action === 'create') toast.error(t('failed_save'));
      if (action === 'update') toast.error(t('failed_save'));
      if (action === 'delete') toast.error(t('failed_delete'));
    }
  );

  // Fetch positions when session is available
  useEffect(() => {
    if (session?.accessToken) {
      crud.fetchPositions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  // Reset to page 1 when view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  // Handlers
  const openAddForm = () => {
    setShowLibraryModal(true);
  };

  const handleLibrarySelect = (library: Library) => {
    setSelectedLibrary(library);
    setFormMode('create');
    setEditingPosition(null);
    setShowForm(true);
    setShowLibraryModal(false);
  };

  const handleContinueWithoutLibrary = () => {
    setSelectedLibrary(null);
    setFormMode('create');
    setEditingPosition(null);
    setShowForm(true);
    setShowLibraryModal(false);
  };

  const openViewForm = (position: Position) => {
    setFormMode('view');
    setEditingPosition(position);
    setSelectedLibrary(null);
    setShowForm(true);
  };

  const openEditForm = (position: Position) => {
    setFormMode('edit');
    setEditingPosition(position);
    setSelectedLibrary(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormMode('create');
    setEditingPosition(null);
    setSelectedLibrary(null);
  };

  const openDeleteDialog = (positionId: number, positionName: string) => {
    setDeleteDialog({
      isOpen: true,
      positionId,
      positionName
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      positionId: null,
      positionName: ''
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.positionId) return;
    const success = await crud.deletePosition(deleteDialog.positionId);
    if (success) {
      closeDeleteDialog();
    }
  };

  const handleFormSubmit = async (
    formData: PositionFormData
  ): Promise<boolean> => {
    if (formMode === 'edit' && editingPosition) {
      return await crud.updatePosition(editingPosition.id, formData);
    } else {
      return await crud.createPosition(formData);
    }
  };

  const handleSwitchToEdit = () => {
    if (editingPosition) {
      setFormMode('edit');
    }
  };

  // Pagination
  const totalPages = Math.ceil(crud.positions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPositions = crud.positions.slice(startIndex, endIndex);

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <h2 className='text-3xl font-bold tracking-tight'>
                {t('positions')}
              </h2>
              <Button
                onClick={openAddForm}
                className='flex items-center gap-2'
                disabled={crud.loading}
              >
                <IconPlus className='h-4 w-4' />
                {t('add')}
              </Button>
            </div>

            {/* View Toggle */}
            {!showForm && (
              <div className='flex items-center space-x-2'>
                <span className='text-muted-foreground text-sm'>
                  {t('view_mode')}
                </span>
                <div className='flex rounded-lg border border-gray-200 p-1'>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('grid')}
                    className='h-8 w-8 p-0'
                  >
                    <Grid3X3 className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('table')}
                    className='h-8 w-8 p-0'
                  >
                    <List className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <p className='text-muted-foreground'>{t('manage')}</p>
        </div>
        <Separator />

        {/* Library Selection Modal */}
        <LibrarySelectionModal
          isOpen={showLibraryModal}
          onClose={() => setShowLibraryModal(false)}
          onSelect={handleLibrarySelect}
          onContinueWithout={handleContinueWithoutLibrary}
        />

        {/* Positions List */}
        {!showForm && (
          <div className='space-y-4'>
            {crud.loading && crud.positions.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <div className='text-muted-foreground text-center'>
                    <p className='mb-2 text-lg font-medium'>{t('loading')}</p>
                  </div>
                </CardContent>
              </Card>
            ) : crud.positions.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <div className='text-muted-foreground text-center'>
                    <IconPlus className='mx-auto mb-4 h-12 w-12 opacity-50' />
                    <p className='mb-2 text-lg font-medium'>{t('none')}</p>
                    <p className='text-sm'>{t('create_first')}</p>
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <>
                <PositionGridView
                  positions={paginatedPositions}
                  onEdit={openEditForm}
                  onDelete={openDeleteDialog}
                  loading={crud.loading}
                />

                {/* Pagination for Grid View */}
                {totalPages > 1 && (
                  <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
                    <div className='text-muted-foreground text-sm'>
                      {t('showing', {
                        start: startIndex + 1,
                        end: Math.min(endIndex, crud.positions.length),
                        total: crud.positions.length
                      })}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className='flex items-center gap-1'>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? 'default' : 'outline'
                            }
                            size='sm'
                            onClick={() => setCurrentPage(page)}
                            className='h-8 w-8 p-0'
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <DataTableView
                  data={paginatedPositions}
                  getRowId={(position) => position.id}
                  columns={[
                    {
                      key: 'name',
                      header: t('position_name'),
                      minWidth: 'min-w-[200px]',
                      cellClassName:
                        'whitespace-normal break-words max-w-[250px]',
                      render: (position) => (
                        <div className='flex flex-col gap-1'>
                          <span className='font-medium break-words'>
                            {position.name}
                          </span>
                          <Badge
                            variant={
                              position.status === 'open'
                                ? 'default'
                                : 'secondary'
                            }
                            className='w-fit'
                          >
                            {position.status === 'open' ? 'Open' : 'Closed'}
                          </Badge>
                        </div>
                      )
                    },
                    {
                      key: 'category',
                      header: t('category'),
                      minWidth: 'min-w-[150px]',
                      cellClassName:
                        'text-sm whitespace-normal break-words max-w-[200px]',
                      render: (position) => (
                        <span className='text-sm break-words'>
                          {position.category?.name || t('no_category')}
                        </span>
                      )
                    },
                    {
                      key: 'expected_hiring_date',
                      header: t('expected_date'),
                      minWidth: 'min-w-[120px]',
                      cellClassName: 'text-sm'
                    },
                    {
                      key: 'workplace_name',
                      header: t('workplace'),
                      minWidth: 'min-w-[150px]',
                      cellClassName:
                        'text-sm whitespace-normal break-words max-w-[200px]',
                      render: (position) => (
                        <span className='text-sm break-words'>
                          {position.workplace_name || t('no_workplace')}
                        </span>
                      )
                    },
                    {
                      key: 'description',
                      header: t('description'),
                      minWidth: 'min-w-[250px]',
                      cellClassName:
                        'text-sm whitespace-normal break-words max-w-[400px]',
                      render: (position) => {
                        const cleanDescription = position.description.replace(
                          /<[^>]*>/g,
                          ''
                        );
                        return (
                          <span className='text-sm break-words'>
                            {cleanDescription || t('no_description')}
                          </span>
                        );
                      }
                    }
                  ]}
                  actionColumn={{
                    header: t('actions'),
                    dropdownLabel: t('actions'),
                    dropdownActions: [
                      {
                        label: t('view'),
                        icon: <IconEye className='h-4 w-4' />,
                        onClick: (position) => openViewForm(position)
                      },
                      {
                        label: t('edit'),
                        icon: <IconEdit className='h-4 w-4' />,
                        onClick: (position) => openEditForm(position)
                      },
                      {
                        label: t('archive'),
                        icon: <IconArchive className='h-4 w-4' />,
                        onClick: (position) =>
                          openDeleteDialog(position.id, position.name)
                      }
                    ]
                  }}
                />
              </>
            )}
          </div>
        )}

        {/* Position Form */}
        {showForm && (
          <PositionForm
            mode={formMode}
            position={editingPosition || undefined}
            selectedLibrary={selectedLibrary}
            referenceData={referenceData}
            loading={crud.loading}
            onClose={closeForm}
            onSubmit={handleFormSubmit}
            onSwitchToEdit={
              formMode === 'view' ? handleSwitchToEdit : undefined
            }
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleDelete}
          title={t('archive_title')}
          description={t('archive_description')}
          itemName={deleteDialog.positionName}
        />
      </div>
    </PageContainer>
  );
}
