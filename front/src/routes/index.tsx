import { createFileRoute, Link } from '@tanstack/react-router'
import { Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layout/PageLayout'
import { InventoryCard } from '@/components/inventories/InventoryCard'
import { usePublicInventories } from '@/hooks/useInventories'
import { useAuthStore } from '@/store/auth.store'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const { user } = useAuthStore()
  const { data: inventories, isLoading } = usePublicInventories()

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Public Inventories</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse and contribute to public collections
          </p>
        </div>
        {user && (
          <Link to="/inventories/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Inventory
            </Button>
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && inventories?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <Package className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">No public inventories yet</p>
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
