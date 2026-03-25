import { Link } from '@tanstack/react-router'
import { Globe, Lock, Package, Tag } from 'lucide-react'
import type { Inventory } from '@/lib/types'

interface InventoryCardProps {
  inventory: Inventory
}

export function InventoryCard({ inventory }: InventoryCardProps) {
  return (
    <Link
      to="/inventories/$inventoryId"
      params={{ inventoryId: inventory.id }}
      className="block border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all bg-card"
    >
      <div className="flex items-start gap-4">
        {inventory.imageUrl ? (
          <img
            src={inventory.imageUrl}
            alt={inventory.title}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{inventory.title}</h3>
            {inventory.isPublic ? (
              <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
          </div>

          {inventory.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {inventory.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {inventory._count && <span>{inventory._count.items} items</span>}
            {inventory.category && (
              <span className="px-2 py-0.5 rounded-full bg-muted">
                {inventory.category}
              </span>
            )}
          </div>

          {inventory.tags && inventory.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <Tag className="w-3 h-3 text-muted-foreground" />
              {inventory.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
