import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ItemsToolbar } from './ItemsToolbar'
import { LikeButton } from './LikeButton'
import type { ColumnDef } from '@tanstack/react-table'
import type { InventoryField, Item } from '@/lib/types'
import { useBulkDeleteItems, useItems } from '@/hooks/useItems'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const columnHelper = createColumnHelper<Item>()

interface ItemsTableProps {
  inventoryId: string
  fields: Array<InventoryField>
  canManage: boolean
}

export function ItemsTable({
  inventoryId,
  fields,
  canManage,
}: ItemsTableProps) {
  const { t } = useTranslation()
  const { data: items = [], isLoading } = useItems(inventoryId)
  const { mutate: bulkDelete, isPending: isDeleting } =
    useBulkDeleteItems(inventoryId)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const visibleFields = fields.filter((f) => f.showInTable)

  const columns = useMemo<Array<ColumnDef<Item, any>>>(() => {
    const cols: Array<ColumnDef<Item, any>> = []

    if (canManage) {
      cols.push(
        columnHelper.display({
          id: 'select',
          header: ({ table }) => (
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="rounded"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              onClick={(e) => e.stopPropagation()}
              className="rounded"
            />
          ),
          size: 40,
        }),
      )
    }

    cols.push(
      columnHelper.accessor('customId', {
        header: t('items.id'),
        cell: (info) => (
          <Link
            to="/inventories/$inventoryId/items/$itemId"
            params={{ inventoryId, itemId: info.row.original.id }}
            className="font-mono text-xs text-primary hover:underline"
          >
            {info.getValue()}
          </Link>
        ),
      }),
    )

    for (const field of visibleFields) {
      cols.push(
        columnHelper.display({
          id: field.id,
          header: field.fieldName,
          cell: ({ row }) => {
            const fv = row.original.fieldValues?.find(
              (v) => v.fieldId === field.id,
            )
            if (!fv) return <span className="text-muted-foreground">—</span>

            if (field.fieldType === 'boolean') {
              return fv.booleanValue ? '✓' : '✗'
            }
            if (field.fieldType === 'number') {
              return fv.numericValue ?? '—'
            }
            if (field.fieldType === 'image' && fv.textValue) {
              return (
                <img
                  src={fv.textValue}
                  alt=""
                  className="w-8 h-8 rounded object-cover"
                />
              )
            }
            return (
              <span className="truncate max-w-[200px] block">
                {fv.textValue ?? '—'}
              </span>
            )
          },
        }),
      )
    }

    cols.push(
      columnHelper.accessor('creator', {
        header: t('items.addedBy'),
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue()?.username ?? '—'}
          </span>
        ),
      }),
    )

    cols.push(
      columnHelper.display({
        id: 'likes',
        header: '',
        cell: ({ row }) => (
          <LikeButton
            inventoryId={inventoryId}
            itemId={row.original.id}
            likedByMe={row.original.likedByMe ?? false}
            count={row.original._count?.likes ?? 0}
          />
        ),
        size: 70,
      }),
    )

    return cols
  }, [visibleFields, inventoryId, canManage])

  const table = useReactTable({
    data: items,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])

  const handleDeleteSelected = () => {
    if (!confirm(`Delete ${selectedIds.length} item(s)?`)) return
    bulkDelete(selectedIds, {
      onSuccess: () => setRowSelection({}),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      {canManage && (
        <ItemsToolbar
          inventoryId={inventoryId}
          selectedIds={selectedIds}
          onDeleteSelected={handleDeleteSelected}
          isDeleting={isDeleting}
        />
      )}

      {items.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          {t('items.noItems')}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-selected={row.getIsSelected()}
                  className="cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
