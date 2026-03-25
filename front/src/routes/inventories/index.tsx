import { Link, createFileRoute } from '@tanstack/react-router'
import { Package, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layout/PageLayout'
import { InventoryCard } from '@/components/inventories/InventoryCard'
import { useMyInventories } from '@/hooks/useInventories'

export const Route = createFileRoute('/inventories/')({
  component: MyInventoriesPage,
})

function MyInventoriesPage() {
  const { t } = useTranslation()
  const { data: inventories, isLoading } = useMyInventories()

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t('inventories.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('inventories.subtitle')}
          </p>
        </div>
        <Link to="/inventories/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('inventories.newInventory')}
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && inventories?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <Package className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm mb-4">{t('inventories.empty')}</p>
          <Link to="/inventories/new">
            <Button variant="outline" size="sm">
              {t('inventories.emptyAction')}
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
