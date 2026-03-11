import { Link } from '@tanstack/react-router'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ItemsToolbarProps {
  inventoryId: string
  selectedIds: string[]
  onDeleteSelected: () => void
  isDeleting?: boolean
}

export function ItemsToolbar({
  inventoryId,
  selectedIds,
  onDeleteSelected,
  isDeleting,
}: ItemsToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {selectedIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteSelected}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete {selectedIds.length} selected
          </Button>
        )}
      </div>

      <Link
        to="/inventories/$inventoryId/items/new"
        params={{ inventoryId }}
      >
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </Link>
    </div>
  )
}
