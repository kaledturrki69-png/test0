now # Reusable View Components

This directory contains reusable view components that help reduce code duplication across pages.

## GridCardView

A flexible grid view component for displaying items in card format.

**Usage**: See `positions-overview/page.tsx` and `candidates/page.tsx` for examples.

## DataTableView

A highly customizable table component that supports:
- Custom columns with flexible rendering
- Selection with checkboxes
- Action buttons (inline and dropdown)
- Bulk actions
- Pagination
- Empty states

### Basic Usage

```typescript
import { DataTableView } from '@/components/views';

<DataTableView
  data={items}
  getRowId={(item) => item.id}
  columns={[
    {
      key: 'name',
      header: 'Name',
      cellClassName: 'font-medium'
    },
    {
      key: 'description',
      header: 'Description'
    }
  ]}
  actionColumn={{
    header: 'Actions',
    dropdownLabel: 'Actions',
    dropdownActions: [
      {
        label: 'Edit',
        icon: <IconEdit className='h-4 w-4' />,
        onClick: (item) => handleEdit(item)
      },
      {
        label: 'Delete',
        icon: <IconTrash className='h-4 w-4' />,
        onClick: (item) => handleDelete(item)
      }
    ]
  }}
/>
```

### Advanced Usage Examples

#### 1. Simple Table (hard-skills, soft-skills, conditions)

```typescript
<DataTableView
  data={paginatedList}
  getRowId={(skill) => skill.id}
  columns={[
    { key: 'name', header: t('name'), cellClassName: 'font-medium' },
    { key: 'description', header: t('description') }
  ]}
  actionColumn={{
    header: t('actions'),
    dropdownLabel: t('actions'),
    dropdownActions: [
      { label: t('view'), icon: <IconEye className='h-4 w-4' />, onClick: viewItem },
      { label: t('edit'), icon: <IconEdit className='h-4 w-4' />, onClick: editItem },
      { label: t('archive'), icon: <IconArchive className='h-4 w-4' />, onClick: deleteItem }
    ]
  }}
/>
```

#### 2. Table with Selection (candidates page)

```typescript
<DataTableView
  data={paginatedCandidates}
  getRowId={(candidate) => candidate.id}
  columns={[
    { key: 'full_name', header: t('name'), cellClassName: 'font-medium' },
    { key: 'position', header: t('position') },
    {
      key: 'contact',
      header: t('contact'),
      render: (candidate) => (
        <div>
          <div>{candidate.email1}</div>
          <div className='text-muted-foreground text-xs'>{candidate.phone1}</div>
        </div>
      )
    }
  ]}
  selection={{
    enabled: true,
    selectedIds: selectedRows,
    onSelectAll: handleSelectAll,
    onSelectRow: handleSelectRow,
    selectionMenuItems: [
      { label: t('clear_selection'), onClick: () => setSelectedRows(new Set()) },
      { label: t('select_by_position'), onClick: handleSelectByPosition, separator: true }
    ],
    bulkActions: [
      { label: t('send_email_selected'), onClick: handleBulkEmail },
      { label: t('schedule_interview_selected'), onClick: handleBulkSchedule }
    ]
  }}
  selectionInfo={
    selectedRows.size > 0 && (
      <div className='flex items-center justify-between rounded-md border bg-blue-50 p-3'>
        <span>{selectedRows.size} selected</span>
        <Button onClick={() => setSelectedRows(new Set())}>Clear</Button>
      </div>
    )
  }
  actionColumn={{
    header: t('actions'),
    buttons: [
      { label: t('view_cv'), onClick: (c) => router.push(`/candidates/${c.id}`) }
    ],
    dropdownActions: [
      { label: t('send_email'), onClick: handleEmail },
      { label: t('schedule_interview'), onClick: handleSchedule }
    ]
  }}
/>
```

#### 3. Table with Multiple Action Buttons (positions page)

```typescript
<DataTableView
  data={positions}
  getRowId={(position) => position.id}
  columns={[
    {
      key: 'name',
      header: t('position_name'),
      render: (position) => (
        <div>
          <div className='font-medium'>{position.name}</div>
          <Badge variant={position.status === 'open' ? 'default' : 'secondary'}>
            {position.status}
          </Badge>
        </div>
      )
    },
    { key: 'category', header: t('category'), render: (p) => p.category?.name },
    { key: 'expected_hiring_date', header: t('expected_date') },
    {
      key: 'description',
      header: t('description'),
      render: (p) => p.description.replace(/<[^>]*>/g, '').substring(0, 200)
    }
  ]}
  actionColumn={{
    header: t('actions'),
    dropdownLabel: t('actions'),
    dropdownActions: [
      { label: t('view'), icon: <IconEye />, onClick: openViewForm },
      { label: t('edit'), icon: <IconEdit />, onClick: openEditForm },
      { label: t('archive'), icon: <IconArchive />, onClick: openDeleteDialog }
    ]
  }}
  pagination={{
    currentPage,
    totalItems: positions.length,
    itemsPerPage,
    onPageChange: setCurrentPage,
    showingText: t('showing', { start, end, total }),
    previousText: t('previous'),
    nextText: t('next')
  }}
/>
```

#### 4. Table with Fixed Layout (for consistent column widths)

```typescript
<DataTableView
  data={data}
  getRowId={(item) => item.id}
  columns={[
    { key: 'name', header: 'Name', width: '200px' },
    { key: 'category', header: 'Category', width: '150px' },
    { key: 'date', header: 'Date', width: '120px' },
    { key: 'description', header: 'Description', width: 'auto' }
  ]}
  tableLayout='fixed'
  actionColumn={{
    header: 'Actions',
    width: '280px',
    dropdownActions: [...]
  }}
/>
```

### Column Configuration

```typescript
interface TableColumn<T> {
  key: string;              // Property key from data object
  header: string;           // Column header text
  width?: string;           // Fixed width (e.g., '200px', 'auto')
  minWidth?: string;        // Tailwind min-width class (e.g., 'min-w-[200px]')
  className?: string;       // Additional header classes
  cellClassName?: string;   // Cell classes (e.g., 'font-medium')
  render?: (item: T) => ReactNode;  // Custom render function
}
```

### Action Column Options

1. **Inline Buttons Only**
```typescript
actionColumn={{
  header: 'Actions',
  buttons: [
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', variant: 'destructive', onClick: handleDelete }
  ]
}}
```

2. **Dropdown Only**
```typescript
actionColumn={{
  header: 'Actions',
  dropdownLabel: 'Actions',
  dropdownActions: [
    { label: 'View', icon: <IconEye />, onClick: handleView },
    { label: 'Edit', icon: <IconEdit />, onClick: handleEdit },
    { label: 'Delete', icon: <IconTrash />, onClick: handleDelete, separator: true }
  ]
}}
```

3. **Both Buttons and Dropdown**
```typescript
actionColumn={{
  header: 'Actions',
  buttons: [
    { label: 'View Details', onClick: handleView }
  ],
  dropdownActions: [
    { label: 'Send Email', onClick: handleEmail },
    { label: 'Archive', onClick: handleArchive }
  ]
}}
```

### Pagination

```typescript
pagination={{
  currentPage: 1,
  totalItems: 100,
  itemsPerPage: 10,
  onPageChange: (page) => setCurrentPage(page),
  showingText: 'Showing {start} to {end} of {total}',  // Optional
  previousText: 'Previous',  // Optional
  nextText: 'Next'          // Optional
}}
```

### Empty State

```typescript
emptyState={
  <Card>
    <CardContent className='flex flex-col items-center justify-center py-12'>
      <Icon className='text-muted-foreground mb-4 h-12 w-12' />
      <h3>{t('no_data')}</h3>
      <p className='text-muted-foreground'>{t('no_data_description')}</p>
    </CardContent>
  </Card>
}
```

## Migration Guide

### Migrating from Manual Table to DataTableView

**Before:**
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Description</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.description}</TableCell>
        <TableCell>
          <DropdownMenu>...</DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**After:**
```typescript
<DataTableView
  data={items}
  getRowId={(item) => item.id}
  columns={[
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' }
  ]}
  actionColumn={{
    header: 'Actions',
    dropdownActions: [...]
  }}
/>
```

## Benefits

✅ **Consistency**: Same look and feel across all tables  
✅ **Maintainability**: Update table behavior in one place  
✅ **Type Safety**: Full TypeScript support  
✅ **Flexibility**: Highly customizable for different use cases  
✅ **Code Reduction**: Reduces table code by ~70%  
✅ **Built-in Features**: Selection, pagination, actions all included  

