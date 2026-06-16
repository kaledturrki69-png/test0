import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MoreVertical } from 'lucide-react';

// Column definition interface
export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string; // e.g., '200px', 'auto', '150px'
  minWidth?: string; // e.g., 'min-w-[200px]'
  className?: string;
  render?: (item: T) => ReactNode;
  cellClassName?: string;
}

// Action button definition
export interface ActionButton<T> {
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  onClick: (item: T) => void;
  disabled?: boolean | ((item: T) => boolean);
}

// Dropdown action definition
export interface DropdownAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  disabled?: boolean | ((item: T) => boolean);
  separator?: boolean; // Add separator before this item
}

// Selection menu item
export interface SelectionMenuItem {
  label: string;
  onClick: () => void;
  separator?: boolean;
}

// Bulk action definition
export interface BulkAction {
  label: string;
  onClick: () => void;
}

export interface DataTableViewProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  getRowId: (item: T) => string | number;

  // Actions configuration
  actionColumn?: {
    header: string;
    width?: string;
    buttons?: ActionButton<T>[]; // Primary action buttons
    dropdownActions?: DropdownAction<T>[]; // Dropdown menu actions
    dropdownLabel?: string; // Label for dropdown menu
  };

  // Selection configuration
  selection?: {
    enabled: boolean;
    selectedIds: Set<string | number>;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string | number, checked: boolean) => void;
    selectionMenuItems?: SelectionMenuItem[];
    bulkActions?: BulkAction[];
  };

  // Pagination
  pagination?: {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    showingText?: string; // Template: "Showing {start} to {end} of {total}"
    previousText?: string;
    nextText?: string;
  };

  // Optional configurations
  scrollHeight?: string; // Default: 'h-[600px]'
  tableLayout?: 'auto' | 'fixed';
  loading?: boolean;
  emptyState?: ReactNode;
  selectionInfo?: ReactNode; // Custom selection info banner
}

export function DataTableView<T>({
  data,
  columns,
  getRowId,
  actionColumn,
  selection,
  pagination,
  scrollHeight = 'h-[600px]',
  tableLayout = 'auto',
  loading = false,
  emptyState,
  selectionInfo
}: DataTableViewProps<T>) {
  const hasSelection = selection?.enabled;
  const hasActions = actionColumn !== undefined;
  const hasBulkActions =
    selection?.bulkActions && selection.bulkActions.length > 0;

  // Check if all items are selected
  const isAllSelected =
    hasSelection &&
    data.length > 0 &&
    data.every((item) => selection.selectedIds.has(getRowId(item)));

  const isSomeSelected =
    hasSelection && selection.selectedIds.size > 0 && !isAllSelected;

  // Pagination calculations
  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.itemsPerPage)
    : 1;
  const startIndex = pagination
    ? (pagination.currentPage - 1) * pagination.itemsPerPage
    : 0;
  const endIndex = pagination
    ? Math.min(startIndex + pagination.itemsPerPage, pagination.totalItems)
    : data.length;

  if (data.length === 0 && !loading) {
    return emptyState || null;
  }

  return (
    <div className='space-y-4'>
      {/* Selection Info Banner */}
      {hasSelection && selection.selectedIds.size > 0 && selectionInfo}

      {/* Table */}
      <div className='w-full overflow-hidden rounded-md border'>
        <div className='w-full overflow-x-auto'>
          <ScrollArea className={`w-full ${scrollHeight}`}>
            <Table
              className='w-full min-w-full'
              style={
                tableLayout === 'fixed'
                  ? { tableLayout: 'fixed', width: '100%' }
                  : undefined
              }
            >
              {/* Column widths for fixed layout */}
              {tableLayout === 'fixed' && (
                <colgroup>
                  {hasSelection && <col style={{ width: '80px' }} />}
                  {columns.map((col, i) => (
                    <col key={i} style={{ width: col.width || 'auto' }} />
                  ))}
                  {hasActions && (
                    <col style={{ width: actionColumn.width || '280px' }} />
                  )}
                </colgroup>
              )}

              <TableHeader className='bg-muted sticky top-0 z-10'>
                <TableRow>
                  {/* Selection Column Header */}
                  {hasSelection && (
                    <TableHead className='w-[80px]'>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={selection.onSelectAll}
                          aria-label='Select all'
                          className={isSomeSelected ? 'opacity-50' : ''}
                        />
                        {selection.selectionMenuItems &&
                          selection.selectionMenuItems.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-6 w-6 p-0'
                                >
                                  <MoreVertical className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='start'>
                                {selection.selectionMenuItems.map(
                                  (item, index) => (
                                    <div key={index}>
                                      {item.separator && (
                                        <DropdownMenuSeparator />
                                      )}
                                      <DropdownMenuItem onClick={item.onClick}>
                                        {item.label}
                                      </DropdownMenuItem>
                                    </div>
                                  )
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                      </div>
                    </TableHead>
                  )}

                  {/* Data Column Headers */}
                  {columns.map((col, index) => (
                    <TableHead
                      key={index}
                      className={`whitespace-nowrap ${col.minWidth || ''} ${col.className || ''}`}
                    >
                      {col.header}
                    </TableHead>
                  ))}

                  {/* Action Column Header */}
                  {hasActions && (
                    <TableHead className='whitespace-nowrap'>
                      <div className='flex items-center gap-2'>
                        <span>{actionColumn.header}</span>
                        {hasBulkActions && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 p-0'
                                disabled={selection!.selectedIds.size === 0}
                              >
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              {selection!.bulkActions!.map((action, index) => (
                                <DropdownMenuItem
                                  key={index}
                                  onClick={action.onClick}
                                >
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((item) => {
                  const rowId = getRowId(item);
                  const isSelected = hasSelection
                    ? selection.selectedIds.has(rowId)
                    : false;

                  return (
                    <TableRow key={rowId}>
                      {/* Selection Checkbox */}
                      {hasSelection && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              selection.onSelectRow(rowId, checked as boolean)
                            }
                            aria-label={`Select row ${rowId}`}
                          />
                        </TableCell>
                      )}

                      {/* Data Cells */}
                      {columns.map((col, index) => (
                        <TableCell
                          key={index}
                          className={`${col.cellClassName || ''} ${col.minWidth || ''}`}
                          style={col.width ? { width: col.width } : undefined}
                        >
                          {col.render
                            ? col.render(item)
                            : String((item as any)[col.key] || '')}
                        </TableCell>
                      ))}

                      {/* Action Cell */}
                      {hasActions && (
                        <TableCell className='whitespace-nowrap'>
                          <div className='flex items-center gap-2'>
                            {/* Primary Action Buttons */}
                            {actionColumn.buttons?.map((button, index) => {
                              const isDisabled =
                                typeof button.disabled === 'function'
                                  ? button.disabled(item)
                                  : button.disabled;

                              return (
                                <Button
                                  key={index}
                                  variant={button.variant || 'default'}
                                  size='sm'
                                  onClick={() => button.onClick(item)}
                                  disabled={isDisabled}
                                >
                                  {button.icon && (
                                    <span className='mr-2'>{button.icon}</span>
                                  )}
                                  {button.label}
                                </Button>
                              );
                            })}

                            {/* Dropdown Actions */}
                            {actionColumn.dropdownActions &&
                              actionColumn.dropdownActions.length > 0 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      className='h-8 w-8 p-0'
                                    >
                                      <MoreVertical className='h-4 w-4' />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align='end'>
                                    {actionColumn.dropdownLabel && (
                                      <DropdownMenuLabel>
                                        {actionColumn.dropdownLabel}
                                      </DropdownMenuLabel>
                                    )}
                                    {actionColumn.dropdownActions.map(
                                      (action, index) => {
                                        const isDisabled =
                                          typeof action.disabled === 'function'
                                            ? action.disabled(item)
                                            : action.disabled;

                                        return (
                                          <div key={index}>
                                            {action.separator && (
                                              <DropdownMenuSeparator />
                                            )}
                                            <DropdownMenuItem
                                              onClick={() =>
                                                action.onClick(item)
                                              }
                                              disabled={isDisabled}
                                            >
                                              {action.icon && (
                                                <span className='mr-2'>
                                                  {action.icon}
                                                </span>
                                              )}
                                              {action.label}
                                            </DropdownMenuItem>
                                          </div>
                                        );
                                      }
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
          <div className='text-muted-foreground text-sm'>
            {pagination.showingText ||
              `Showing ${startIndex + 1} to ${endIndex} of ${pagination.totalItems}`}
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage === 1}
            >
              {pagination.previousText || 'Previous'}
            </Button>
            <div className='flex flex-wrap items-center gap-1'>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={
                      pagination.currentPage === page ? 'default' : 'outline'
                    }
                    size='sm'
                    onClick={() => pagination.onPageChange(page)}
                    className='h-8 w-8 p-0'
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={pagination.currentPage === totalPages}
            >
              {pagination.nextText || 'Next'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
