import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageLayout } from '@/components/layout/PageLayout'
import { ItemForm } from '@/components/items/ItemForm'
import { useInventory } from '@/hooks/useInventories'
import { useCreateItem } from '@/hooks/useItems'
import type { CreateItemPayload } from '@/api/items'

export const Route = createFileRoute('/inventories/$inventoryId/items/new')({
  component: NewItemPage,
})

function NewItemPage() {
  const { inventoryId } = Route.useParams()
  const navigate = useNavigate()
  const { data: inventory, isLoading } = useInventory(inventoryId)
  const { mutate: create, isPending } = useCreateItem(inventoryId)

  const handleSubmit = (data: CreateItemPayload) => {
    create(data, {
      onSuccess: () => {
        navigate({
          to: '/inventories/$inventoryId',
          params: { inventoryId },
        })
      },
    })
  }

  if (isLoading || !inventory) {
    return (
      <PageLayout className="max-w-xl">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
      </PageLayout>
    )
  }

  return (
    <PageLayout className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add Item</h1>
        <p className="text-muted-foreground text-sm mt-1">{inventory.title}</p>
      </div>

      <ItemForm
        fields={inventory.fields ?? []}
        hasCustomIdFormat={!!inventory.customIdFormat?.elements?.length}
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Add Item"
      />
    </PageLayout>
  )
}
