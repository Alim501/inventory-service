import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { CreateInventoryPayload } from '@/api/inventories'
import type { Tag } from '@/lib/types'
import { PageLayout } from '@/components/layout/PageLayout'
import { InventoryForm } from '@/components/inventories/InventoryForm'
import { useCreateInventory } from '@/hooks/useInventories'

export const Route = createFileRoute('/inventories/new')({
  component: NewInventoryPage,
})

function NewInventoryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: create, isPending } = useCreateInventory()

  const handleSubmit = (data: CreateInventoryPayload, tags: Array<Tag>) => {
    create(
      { ...data, tagIds: tags.map((t) => t.id) },
      {
        onSuccess: (inventory) => {
          navigate({
            to: '/inventories/$inventoryId',
            params: { inventoryId: inventory.id },
          })
        },
      },
    )
  }

  return (
    <PageLayout className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('inventoryForm.newTitle')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('inventoryForm.newSubtitle')}
        </p>
      </div>

      <InventoryForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel={t('inventoryForm.create')}
      />
    </PageLayout>
  )
}
