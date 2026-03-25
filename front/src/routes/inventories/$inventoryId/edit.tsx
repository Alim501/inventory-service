import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { CreateInventoryPayload } from '@/api/inventories'
import type { Tag } from '@/lib/types'
import { PageLayout } from '@/components/layout/PageLayout'
import { InventoryForm } from '@/components/inventories/InventoryForm'
import { useInventory, useUpdateInventory } from '@/hooks/useInventories'

export const Route = createFileRoute('/inventories/$inventoryId/edit')({
  component: EditInventoryPage,
})

function EditInventoryPage() {
  const { t } = useTranslation()
  const { inventoryId } = Route.useParams()
  const navigate = useNavigate()
  const { data: inventory, isLoading } = useInventory(inventoryId)
  const { mutate: update, isPending } = useUpdateInventory(inventoryId)

  const handleSubmit = (data: CreateInventoryPayload, tags: Array<Tag>) => {
    if (!inventory) return
    update(
      { ...data, version: inventory.version, tagIds: tags.map((t) => t.id) },
      {
        onSuccess: () => {
          navigate({ to: '/inventories/$inventoryId', params: { inventoryId } })
        },
      },
    )
  }

  if (isLoading) {
    return (
      <PageLayout className="max-w-2xl">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('inventory.editTitle')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{inventory?.title}</p>
      </div>

      <InventoryForm
        defaultValues={inventory}
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel={t('inventoryForm.save')}
      />
    </PageLayout>
  )
}
