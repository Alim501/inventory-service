import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CreateItemPayload } from '@/api/items'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layout/PageLayout'
import { ItemForm } from '@/components/items/ItemForm'
import { LikeButton } from '@/components/items/LikeButton'
import { useInventory } from '@/hooks/useInventories'
import { useItem, useUpdateItem } from '@/hooks/useItems'
import { useAuthStore } from '@/store/auth.store'
import { FIELD_TYPE_LABELS } from '@/lib/constants'

export const Route = createFileRoute('/inventories/$inventoryId/items/$itemId')(
  { component: ItemDetailPage },
)

function ItemDetailPage() {
  const { t } = useTranslation()
  const { inventoryId, itemId } = Route.useParams()
  const { user } = useAuthStore()
  const { data: inventory } = useInventory(inventoryId)
  const { data: item, isLoading } = useItem(inventoryId, itemId)
  const { mutate: update, isPending } = useUpdateItem(inventoryId, itemId)
  const [editing, setEditing] = useState(false)

  const canManage =
    user?.isAdmin || (user && item && item.creatorId === user.id)

  const handleUpdate = (data: CreateItemPayload) => {
    if (!item) return
    update(
      { ...data, version: item.version },
      { onSuccess: () => setEditing(false) },
    )
  }

  if (isLoading || !item || !inventory) {
    return (
      <PageLayout className="max-w-xl">
        <div className="space-y-3 animate-pulse">
          <div className="h-6 bg-muted rounded w-32" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <Link
          to="/inventories/$inventoryId"
          params={{ inventoryId }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold font-mono">{item.customId}</h1>

        <div className="ml-auto flex items-center gap-1">
          <LikeButton
            inventoryId={inventoryId}
            itemId={item.id}
            likedByMe={item.likedByMe ?? false}
            count={item._count?.likes ?? 0}
          />
          {canManage && !editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Pencil className="w-3.5 h-3.5 mr-1" />
              {t('common.edit')}
            </Button>
          )}
        </div>
      </div>

      {editing ? (
        <ItemForm
          fields={inventory.fields ?? []}
          defaultValues={item}
          hasCustomIdFormat={!!inventory.customIdFormat?.elements.length}
          onSubmit={handleUpdate}
          isLoading={isPending}
          submitLabel={t('common.save')}
        />
      ) : (
        <div className="space-y-4">
          {item.fieldValues?.map((fv) => {
            const field = inventory.fields?.find((f) => f.id === fv.fieldId)
            if (!field) return null

            return (
              <div key={fv.fieldId} className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  {field.fieldName}
                  <span className="ml-1 normal-case">
                    ({FIELD_TYPE_LABELS[field.fieldType]})
                  </span>
                </p>
                <div className="text-sm">
                  {field.fieldType === 'boolean' ? (
                    fv.booleanValue ? (
                      `✓ ${t('items.yes')}`
                    ) : (
                      `✗ ${t('items.yes')}`
                    )
                  ) : field.fieldType === 'number' ? (
                    (fv.numericValue ?? '—')
                  ) : field.fieldType === 'image' && fv.textValue ? (
                    <img
                      src={fv.textValue}
                      alt=""
                      className="max-w-xs rounded-lg border border-border"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{fv.textValue || '—'}</p>
                  )}
                </div>
              </div>
            )
          })}

          {(!item.fieldValues || item.fieldValues.length === 0) && (
            <p className="text-sm text-muted-foreground">
              {t('items.noFieldValues')}
            </p>
          )}
        </div>
      )}
    </PageLayout>
  )
}
