import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Copy, Globe, Key, Lock, Package, Pencil, RefreshCw, Trash2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layout/PageLayout'
import { ItemsTable } from '@/components/items/ItemsTable'
import { CommentsList } from '@/components/comments/CommentsList'
import { AccessManager } from '@/components/inventories/AccessManager'
import { useDeleteInventory, useGenerateApiToken, useInventory } from '@/hooks/useInventories'
import { useAuthStore } from '@/store/auth.store'

export const Route = createFileRoute('/inventories/$inventoryId/')({
  component: InventoryDetailPage,
})

function InventoryDetailPage() {
  const { t } = useTranslation()
  const { inventoryId } = Route.useParams()
  const { data: inventory, isLoading } = useInventory(inventoryId)
  const { mutate: remove, isPending: isDeleting } = useDeleteInventory()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [showAccess, setShowAccess] = useState(false)

  const { mutate: generateToken, isPending: isGeneratingToken } = useGenerateApiToken(inventoryId)
  const [tokenCopied, setTokenCopied] = useState(false)

  const isOwner = !!(user && inventory && inventory.creatorId === user.id)
  const hasAccess = !!(user && inventory?.accessUsers?.some((a) => a.userId === user.id))
  const canManage = user?.isAdmin || isOwner || hasAccess

  const handleCopyToken = () => {
    if (!inventory?.apiToken) return
    navigator.clipboard.writeText(inventory.apiToken)
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 2000)
  }

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
          <p className="text-sm">{t('inventory.notFound')}</p>
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
            <p className="text-muted-foreground text-sm">
              {inventory.description}
            </p>
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
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAccess((v) => !v)}
              >
                <Users className="w-4 h-4 mr-1" />
                {t('inventory.share')}
              </Button>
            )}
            <Link
              to="/inventories/$inventoryId/edit"
              params={{ inventoryId: inventory.id }}
            >
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-1" />
                {t('common.edit')}
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
              {t('common.delete')}
            </Button>
          </div>
        )}
      </div>

      {/* Access manager */}
      {showAccess && (
        <div className="mb-6 p-4 border border-border rounded-xl bg-muted/30">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
            {t('inventory.sharedAccess')}
          </p>
          <AccessManager inventoryId={inventory.id} />
        </div>
      )}

      {/* Fields info */}
      {inventory.fields && inventory.fields.length > 0 && (
        <div className="mb-6 p-4 border border-border rounded-xl bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            {t('inventory.fields')}
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

      {/* API Token section */}
      {isOwner && (
        <div className="mb-6 p-4 border border-border rounded-xl bg-muted/30">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
            API Token
          </p>
          {inventory.apiToken ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background border border-border rounded px-3 py-2 font-mono truncate text-muted-foreground">
                {inventory.apiToken}
              </code>
              <button
                onClick={handleCopyToken}
                title={tokenCopied ? t('inventory.apiTokenCopied') : t('inventory.apiTokenCopy')}
                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => generateToken()}
                disabled={isGeneratingToken}
                title={t('inventory.apiTokenRegenerate')}
                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingToken ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => generateToken()}
              disabled={isGeneratingToken}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Key className="w-3.5 h-3.5" />
              {t('inventory.apiTokenGenerate')}
            </button>
          )}
        </div>
      )}

      {/* Items section */}
      <h2 className="text-lg font-semibold mb-4">{t('inventory.items')}</h2>
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
