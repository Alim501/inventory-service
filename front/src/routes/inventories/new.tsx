import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageLayout } from '@/components/layout/PageLayout'
import { InventoryForm } from '@/components/inventories/InventoryForm'
import { useCreateInventory } from '@/hooks/useInventories'
import type { CreateInventoryPayload } from '@/api/inventories'
import type { Tag } from '@/lib/types'

export const Route = createFileRoute('/inventories/new')({ component: NewInventoryPage })

function NewInventoryPage() {
  const navigate = useNavigate()
  const { mutate: create, isPending } = useCreateInventory()

  const handleSubmit = (data: CreateInventoryPayload, tags: Tag[]) => {
    // tags передаём как tagIds — бэк должен принять массив id
    create(
      { ...data, tagIds: tags.map((t) => t.id) },
      {
        onSuccess: (inventory) => {
          navigate({ to: '/inventories/$inventoryId', params: { inventoryId: inventory.id } })
        },
      },
    )
  }

  return (
    <PageLayout className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">New Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Define your collection template
        </p>
      </div>

      <InventoryForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Create Inventory"
      />
    </PageLayout>
  )
}
