'use client';

import { useState, useMemo, useCallback } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { DataTableView, TableColumn } from '@/components/views';
import { Badge } from '@/components/ui/badge';
import { QuizTemplate } from '@/types/quiz';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import {
  useQuizData,
  useQuizFilters,
  useQuizForm,
  useQuizOperations
} from '@/components/quizzes/hooks';
import { useCategories } from '@/components/quizzes/hooks/quiz/use-categories';
import {
  QuizHeader,
  QuizFilters,
  QuizGridView,
  QuizEmptyState,
  QuizFormDialog
} from '@/components/quizzes/components';
import { getSkillName } from '@/components/quizzes/utils/quiz-utils';
import { usePageTitle } from '@/hooks/use-page-title';
import { useTranslations } from 'next-intl';

export default function QuizzesPage() {
  usePageTitle('Quizzes');
  const t = useTranslations('quizzes_page');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedSkillId, setSelectedSkillId] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Data management
  const { templates, setTemplates, hardSkills, softSkills, loading } =
    useQuizData();
  const { categories } = useCategories();

  const { filteredTemplates } = useQuizFilters({
    templates,
    selectedSkillId,
    searchTerm
  });

  // Form management
  const {
    formData,
    setFormData,
    creating,
    updating,
    handleEdit,
    handleCreate,
    handleUpdate,
    resetForm
  } = useQuizForm(hardSkills, softSkills, templates, setTemplates);

  const { deleteDialog, handleDelete, openDeleteDialog, closeDeleteDialog } =
    useQuizOperations(templates, setTemplates);

  const getLanguageName = useCallback((code: string | undefined) => {
    switch ((code || '').toLowerCase()) {
      case 'fr':
        return 'French';
      case 'ar':
        return 'Arabic';
      case 'en':
      default:
        return 'English';
    }
  }, []);

  const getLanguagesDisplay = useCallback(
    (template: QuizTemplate) => {
      const isMulti = (template.language_mode ?? 'fixed') === 'flexible';
      const languageCodes = template.languages || [
        template.language_code || 'en'
      ];

      if (isMulti && languageCodes.length > 1) {
        return languageCodes.map(getLanguageName).join(' / ');
      }

      return getLanguageName(
        languageCodes[0] || template.language_code || 'en'
      );
    },
    [getLanguageName]
  );

  // Table columns configuration
  const tableColumns: TableColumn<QuizTemplate>[] = useMemo(
    () => [
      {
        key: 'name',
        header: t('name'),
        cellClassName: 'font-medium'
      },
      {
        key: 'description',
        header: t('description'),
        render: (template: QuizTemplate) => template.description || '-'
      },
      {
        key: 'skill',
        header: t('skill'),
        render: (template: QuizTemplate) => (
          <Badge variant='outline'>
            {getSkillName(template.skill, hardSkills, softSkills)}
          </Badge>
        )
      },
      {
        key: 'language',
        header: t('language'),
        render: (template: QuizTemplate) => {
          const languageMode =
            (template.language_mode ?? 'fixed') === 'fixed'
              ? t('single')
              : t('multi');
          return `${languageMode}: ${getLanguagesDisplay(template)}`;
        }
      }
    ],
    [hardSkills, softSkills, getLanguagesDisplay, t]
  );

  const handleEditClick = (template: QuizTemplate) => {
    handleEdit(template);
    setShowEditDialog(true);
  };

  const handleCreateClick = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const handleCreateSubmit = () => {
    handleCreate();
    setShowCreateDialog(false);
  };

  const handleUpdateSubmit = () => {
    handleUpdate();
    setShowEditDialog(false);
  };

  const handleCancelCreate = () => {
    setShowCreateDialog(false);
    resetForm();
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    resetForm();
  };

  const hasFilters = searchTerm !== '' || selectedSkillId !== 'all';

  if (loading && templates.length === 0) {
    return (
      <PageContainer scrollable>
        <div className='container mx-auto p-6'>
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin' />
            <span className='ml-2'>{t('loading_quizzes')}</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        {/* Header */}
        <QuizHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddClick={handleCreateClick}
          loading={loading}
          templates={templates}
        />

        <Separator />

        {/* Filters */}
        <QuizFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSkillId={selectedSkillId}
          onSkillChange={setSelectedSkillId}
          hardSkills={hardSkills}
          softSkills={softSkills}
        />

        {/* List */}
        <div className='space-y-4'>
          {loading && filteredTemplates.length === 0 ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <QuizEmptyState
              hasFilters={hasFilters}
              onCreateClick={handleCreateClick}
            />
          ) : viewMode === 'grid' ? (
            <QuizGridView
              templates={filteredTemplates}
              hardSkills={hardSkills}
              softSkills={softSkills}
              onEdit={handleEditClick}
              onDelete={openDeleteDialog}
            />
          ) : (
            <DataTableView
              data={filteredTemplates}
              columns={tableColumns}
              getRowId={(template) => String(template.id)}
              actionColumn={{
                header: t('actions'),
                buttons: [
                  {
                    label: t('edit'),
                    icon: <IconEdit className='h-4 w-4' />,
                    variant: 'ghost',
                    onClick: (template: QuizTemplate) =>
                      handleEditClick(template)
                  },
                  {
                    label: t('question'),
                    icon: <IconPlus className='h-4 w-4' />,
                    variant: 'ghost',
                    onClick: (template: QuizTemplate) => {
                      const pathname = window.location.pathname;
                      const locale = pathname.split('/')[1] || 'en';
                      window.location.href = `/${locale}/dashboard/quizzes/question?quizId=${template.id}&new=true`;
                    }
                  },
                  {
                    label: t('delete'),
                    icon: <IconTrash className='h-4 w-4' />,
                    variant: 'ghost',
                    onClick: (template: QuizTemplate) =>
                      openDeleteDialog(template)
                  }
                ]
              }}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={() => {
          if (deleteDialog.id) {
            handleDelete(deleteDialog.id);
          }
        }}
        itemName={deleteDialog.name}
        title={t('delete_template')}
        description={t('delete_description')}
      />

      {/* Create Dialog */}
      <QuizFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        formData={formData}
        onFormDataChange={setFormData}
        hardSkills={hardSkills}
        softSkills={softSkills}
        categories={categories}
        onSubmit={handleCreateSubmit}
        onCancel={handleCancelCreate}
        isEdit={false}
        loading={creating}
      />

      {/* Edit Dialog */}
      <QuizFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        formData={formData}
        onFormDataChange={setFormData}
        hardSkills={hardSkills}
        softSkills={softSkills}
        categories={categories}
        onSubmit={handleUpdateSubmit}
        onCancel={handleCancelEdit}
        isEdit={true}
        loading={updating}
      />
    </PageContainer>
  );
}
