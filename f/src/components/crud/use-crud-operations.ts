import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  CrudPageConfig,
  CrudItem,
  DeleteDialogState,
  FormState
} from './types';

interface UseCrudOperationsProps<T extends CrudItem> {
  config: CrudPageConfig<T>;
}

interface UseCrudOperationsReturn<T extends CrudItem> {
  // Data
  items: T[];
  loading: boolean;

  // Form state
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  formData: FormState;
  editingId: number | null;
  isViewMode: boolean;

  // View state
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  totalPages: number;
  paginatedItems: T[];
  startIndex: number;
  endIndex: number;

  // Delete dialog
  deleteDialog: DeleteDialogState;

  // Handlers
  openForm: () => void;
  updateFormField: (key: string, value: string) => void;
  submitForm: () => Promise<void>;
  viewItem: (item: T) => void;
  editItem: (item: T) => void;
  openDeleteDialog: (id: number, name: string) => void;
  closeDeleteDialog: () => void;
  deleteItem: () => Promise<void>;
  fetchItems: () => Promise<void>;
}

export function useCrudOperations<T extends CrudItem>({
  config
}: UseCrudOperationsProps<T>): UseCrudOperationsReturn<T> {
  const { data: session } = useSession();
  const t = useTranslations(config.translations || 'dashboard');

  // State
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormState>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    itemId: null,
    itemName: ''
  });

  const itemsPerPage = 10;

  // Initialize form data from fields
  const initializeFormData = useCallback(() => {
    const initialData: FormState = {};
    config.fields.forEach((field) => {
      initialData[field.key] = '';
    });
    return initialData;
  }, [config.fields]);

  // Fetch items
  const fetchItems = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const url = new URL(config.apiEndpoint, window.location.origin);

      // Add additional params to URL
      if (config.additionalParams) {
        Object.entries(config.additionalParams).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      // Handle different response formats
      let itemsArray = config.responseKey
        ? data[config.responseKey] || data
        : Array.isArray(data)
          ? data
          : [];

      if (
        config.additionalParams?.type &&
        Array.isArray(itemsArray) &&
        itemsArray.length > 0
      ) {
        const requestedType = String(
          config.additionalParams.type
        ).toLowerCase();
        itemsArray = itemsArray.filter((item: any) => {
          const itemType = item?.type ? String(item.type).toLowerCase() : '';
          return itemType === requestedType;
        });
      }

      setItems(itemsArray);
    } catch (error) {
      toast.error(t('load_failed'));
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, config, t]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchItems();
    }
  }, [session?.accessToken, fetchItems]);

  // Reset to page 1 when view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  // Form handlers
  const openForm = useCallback(() => {
    setFormData(initializeFormData());
    setShowForm(true);
    setEditingId(null);
    setIsViewMode(false);
  }, [initializeFormData]);

  const updateFormField = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submitForm = useCallback(async () => {
    if (!session?.accessToken) {
      toast.error(t('signin_required'));
      return;
    }

    // Validate required fields
    const missingFields = config.fields
      .filter((field) => field.required)
      .filter((field) => !String(formData[field.key]).trim());

    if (missingFields.length > 0) {
      toast.error(t('fill_fields'));
      return;
    }

    // Custom validation
    if (config.validateForm) {
      const validationError = config.validateForm(formData);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    try {
      setLoading(true);
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${config.apiEndpoint}/${editingId}`
        : config.apiEndpoint;

      // Build payload
      const payload: Record<string, any> = {};
      config.fields.forEach((field) => {
        const value = formData[field.key];
        payload[field.key] = String(value).trim();
      });

      // Add additional payload fields
      if (config.additionalPayloadFields) {
        Object.assign(payload, config.additionalPayloadFields);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed';
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error ||
            errorData.detail ||
            errorData.message ||
            `HTTP ${response.status}`;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      toast.success(editingId ? t('updated') : t('created'));
      setShowForm(false);
      setEditingId(null);
      setIsViewMode(false);
      await fetchItems();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      toast.error(
        editingId
          ? `${t('update_failed')}: ${errorMessage}`
          : `${t('create_failed')}: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, config, formData, editingId, t, fetchItems]);

  const viewItem = useCallback(
    (item: T) => {
      const data: FormState = {};
      config.fields.forEach((field) => {
        data[field.key] = item[field.key] || '';
      });
      setFormData(data);
      setEditingId(item.id);
      setIsViewMode(true);
      setShowForm(true);
    },
    [config.fields]
  );

  const editItem = useCallback(
    (item: T) => {
      const data: FormState = {};
      config.fields.forEach((field) => {
        data[field.key] = item[field.key] || '';
      });
      setFormData(data);
      setEditingId(item.id);
      setIsViewMode(false);
      setShowForm(true);
    },
    [config.fields]
  );

  const openDeleteDialog = useCallback((id: number, name: string) => {
    setDeleteDialog({ isOpen: true, itemId: id, itemName: name });
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ isOpen: false, itemId: null, itemName: '' });
  }, []);

  const deleteItem = useCallback(async () => {
    if (!session?.accessToken || !deleteDialog.itemId) {
      toast.error(t('signin_required'));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${config.apiEndpoint}/${deleteDialog.itemId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${session.accessToken}` }
        }
      );

      if (!response.ok) throw new Error('Failed');

      toast.success(t('deleted'));
      await fetchItems();
    } catch (error) {
      toast.error(t('delete_failed'));
    } finally {
      setLoading(false);
      closeDeleteDialog();
    }
  }, [
    session?.accessToken,
    deleteDialog.itemId,
    config.apiEndpoint,
    t,
    fetchItems,
    closeDeleteDialog
  ]);

  // Pagination
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
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
    itemsPerPage,
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
    deleteItem,
    fetchItems
  };
}
