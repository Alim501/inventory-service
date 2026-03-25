import { Link } from '@tanstack/react-router'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface ItemsToolbarProps {
  inventoryId: string
  selectedIds: Array<string>
  onDeleteSelected: () => void
  isDeleting?: boolean
}

export function ItemsToolbar({
  inventoryId,
  selectedIds,
  onDeleteSelected,
  isDeleting,
}: ItemsToolbarProps) {
  const { t } = useTranslation()
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
            {t('items.deleteSelected', { count: selectedIds.length })}
          </Button>
        )}
      </div>

      <Link to="/inventories/$inventoryId/items/new" params={{ inventoryId }}>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" />
          {t('items.addItem')}
        </Button>
      </Link>
    </div>
  )
}
