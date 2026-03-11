import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layout/PageLayout'
import { InventoryCard } from '@/components/inventories/InventoryCard'
import { useMyInventories, useDeleteInventory } from '@/hooks/useInventories'

export const Route = createFileRoute('/inventories/')({ component: MyInventoriesPage })

function MyInventoriesPage() {
  const { data: inventories, isLoading } = useMyInventories()
  const deleteMutation = useDeleteInventory()

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Inventories</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your collections
          </p>
        </div>
        <Link to="/inventories/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Inventory
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && inventories?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <Package className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm mb-4">You have no inventories yet</p>
          <Link to="/inventories/new">
            <Button variant="outline" size="sm">
              Create your first inventory
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && inventories && inventories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventories.map((inv) => (
            <InventoryCard key={inv.id} inventory={inv} />
          ))}
        </div>
      )}
    </PageLayout>
  )
}
