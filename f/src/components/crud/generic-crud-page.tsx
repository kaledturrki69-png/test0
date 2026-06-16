'use client';

import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { DataTableView } from '@/components/views';
import { IconEye, IconEdit, IconArchive } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCrudOperations } from './use-crud-operations';
import {
  CrudHeader,
  CrudForm,
  CrudGridView,
  CrudEmptyStates,
  CrudPagination
} from './components';
import { CrudPageConfig, CrudItem } from './types';
import { memo } from 'react';

interface GenericCrudPageProps<T extends CrudItem> {
  config: CrudPageConfig<T>;
}

export const GenericCrudPage = memo(function GenericCrudPage<
  T extends CrudItem
>({ config }: GenericCrudPageProps<T>) {
  const t = useTranslations(config.translations || 'dashboard');

  const {
    items,
    loading,
    showForm,
    setShowForm,
    formData,
    editingId,
    isViewMode,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    startIndex,
    endIndex,
    deleteDialog,
    openForm,
    updateFormField,
    submitForm,
    viewItem,
    editItem,
    openDeleteDialog,
    closeDeleteDialog,
    deleteItem
  } = useCrudOperations({ config });

  // Helper to get label with fallback
  const getLabel = (key: string, fallback: string): string => {
    if (config.labels && config.labels[key as keyof typeof config.labels]) {
      return config.labels[key as keyof typeof config.labels] || fallback;
    }
    if (config.translations) {
      try {
        return t(key);
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  // Get form title
  const getFormTitle = () => {
    if (isViewMode)
      return getLabel(
        'view',
        config.labels?.view || `View ${config.title.slice(0, -1)}`
      );
    if (editingId)
      return getLabel(
        'edit',
        config.labels?.edit || `Edit ${config.title.slice(0, -1)}`
      );
    return getLabel(
      'add',
      config.labels?.add || `Add ${config.title.slice(0, -1)}`
    );
  };

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        {/* Header */}
        <CrudHeader
          title={config.title}
          subtitle={config.subtitle}
          addButtonText={getLabel('add', config.labels?.add || 'Add')}
          viewLabel={getLabel(
            'view_label',
            config.labels?.viewLabel || 'View:'
          )}
          onAdd={openForm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showForm={showForm}
          loading={loading}
        />

        <Separator />

        {/* Form */}
        {showForm && (
          <CrudForm
            title={getFormTitle()}
            fields={config.fields}
            formData={formData}
            onFieldChange={updateFormField}
            onSubmit={submitForm}
            onClose={() => {
              setShowForm(false);
            }}
            isViewMode={isViewMode}
            loading={loading}
            editingId={editingId}
            submitText={getLabel('submit', config.labels?.submit || 'Submit')}
            updateText={getLabel('update', config.labels?.update || 'Update')}
            loadingText={getLabel(
              'loading',
              config.labels?.loading || 'Loading...'
            )}
            closeText={getLabel('close', config.labels?.close || 'Close')}
          />
        )}

        {/* List */}
        {!showForm && (
          <div className='space-y-4'>
            {loading && items.length === 0 ? (
              <CrudEmptyStates
                type='loading'
                loadingText={getLabel(
                  'loading',
                  config.labels?.loading || 'Loading...'
                )}
              />
            ) : items.length === 0 ? (
              <CrudEmptyStates
                type='empty'
                emptyTitle={getLabel(
                  'empty_title',
                  config.labels?.emptyTitle || 'No items yet'
                )}
                emptyDescription={getLabel(
                  'empty_description',
                  config.labels?.emptyDescription ||
                    'Create your first item to get started'
                )}
              />
            ) : viewMode === 'grid' ? (
              <>
                <CrudGridView
                  items={paginatedItems}
                  onEdit={editItem}
                  onDelete={openDeleteDialog}
                  loading={loading}
                  renderItem={config.renderGridItem}
                  getItemName={(item) => String(item.name || item.id)}
                  getItemDescription={(item) => {
                    // For conditions, include formula
                    if (item.formula) {
                      return `${item.description} (Formula: ${item.formula})`;
                    }
                    return String(item.description || '');
                  }}
                />
                <CrudPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={items.length}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  onPageChange={setCurrentPage}
                  showingText={
                    config.labels?.showing ||
                    `Showing ${startIndex + 1} to ${Math.min(endIndex, items.length)} of ${items.length}`
                  }
                  previousText={getLabel(
                    'previous',
                    config.labels?.previous || 'Previous'
                  )}
                  nextText={getLabel('next', config.labels?.next || 'Next')}
                />
              </>
            ) : (
              <DataTableView
                data={paginatedItems}
                getRowId={(item) => item.id}
                columns={config.tableColumns}
                actionColumn={{
                  header: getLabel(
                    'actions',
                    config.labels?.actions || 'Actions'
                  ),
                  dropdownLabel: getLabel(
                    'actions',
                    config.labels?.actions || 'Actions'
                  ),
                  dropdownActions: [
                    {
                      label: getLabel('view', 'View'),
                      icon: <IconEye className='h-4 w-4' />,
                      onClick: (item) => viewItem(item)
                    },
                    {
                      label: getLabel('edit', 'Edit'),
                      icon: <IconEdit className='h-4 w-4' />,
                      onClick: (item) => editItem(item)
                    },
                    {
                      label: getLabel('archive', 'Archive'),
                      icon: <IconArchive className='h-4 w-4' />,
                      onClick: (item) =>
                        openDeleteDialog(item.id, String(item.name || item.id))
                    }
                  ]
                }}
              />
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={closeDeleteDialog}
          onConfirm={deleteItem}
          title={getLabel('archive_title', 'Archive Item')}
          description={getLabel(
            'archive_description',
            'Are you sure you want to archive this item?'
          )}
          itemName={deleteDialog.itemName}
        />
      </div>
    </PageContainer>
  );
}) as <T extends CrudItem>(
  props: GenericCrudPageProps<T>
) => React.ReactElement;
