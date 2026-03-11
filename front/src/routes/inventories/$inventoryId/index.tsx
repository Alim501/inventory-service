import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Pencil, Trash2, Globe, Lock, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layout/PageLayout'
import { ItemsTable } from '@/components/items/ItemsTable'
import { CommentsList } from '@/components/comments/CommentsList'
import { useInventory, useDeleteInventory } from '@/hooks/useInventories'
import { useAuthStore } from '@/store/auth.store'

export const Route = createFileRoute('/inventories/$inventoryId/')({
  component: InventoryDetailPage,
})

function InventoryDetailPage() {
  const { inventoryId } = Route.useParams()
  const { data: inventory, isLoading } = useInventory(inventoryId)
  const { mutate: remove, isPending: isDeleting } = useDeleteInventory()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const canManage =
    user?.isAdmin || (user && inventory && inventory.creatorId === user.id)

  const handleDelete = () => {
    if (!inventory) return
    if (!confirm(`Delete "${inventory.title}"?`)) return
    remove(
      { id: inventory.id, version: inventory.version },
      { onSuccess: () => navigate({ to: '/inventories' }) },
    )
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-4 bg-muted rounded w-96" />
        </div>
      </PageLayout>
    )
  }

  if (!inventory) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Package className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">Inventory not found or access denied</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold truncate">{inventory.title}</h1>
            {inventory.isPublic ? (
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </div>
          {inventory.description && (
            <p className="text-muted-foreground text-sm">{inventory.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {inventory.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {inventory.category}
              </span>
            )}
            {inventory.tags?.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {canManage && (
          <div className="flex gap-2 ml-4 shrink-0">
            <Link
              to="/inventories/$inventoryId/edit"
              params={{ inventoryId: inventory.id }}
            >
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Fields info */}
      {inventory.fields && inventory.fields.length > 0 && (
        <div className="mb-6 p-4 border border-border rounded-xl bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Fields
          </p>
          <div className="flex flex-wrap gap-2">
            {inventory.fields.map((field) => (
              <span
                key={field.id}
                className="text-xs px-2 py-1 rounded bg-background border border-border"
              >
                {field.fieldName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Items section */}
      <h2 className="text-lg font-semibold mb-4">Items</h2>
      <ItemsTable
        inventoryId={inventory.id}
        fields={inventory.fields ?? []}
        canManage={!!canManage}
      />

      {/* Comments section */}
      <div className="mt-10">
        <CommentsList inventoryId={inventory.id} />
      </div>
    </PageLayout>
  )
}
