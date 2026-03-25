import { useState } from 'react'
import Markdown from 'react-markdown'
import { useTranslation } from 'react-i18next'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { Comment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useDeleteComment, useUpdateComment } from '@/hooks/useComments'
import { useAuthStore } from '@/store/auth.store'

interface CommentItemProps {
  comment: Comment
  inventoryId: string
}

export function CommentItem({ comment, inventoryId }: CommentItemProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.content)

  const { mutate: update, isPending: isUpdating } =
    useUpdateComment(inventoryId)
  const { mutate: remove, isPending: isRemoving } =
    useDeleteComment(inventoryId)

  const canEdit = user?.isAdmin || user?.id === comment.userId

  const handleSave = () => {
    if (!draft.trim()) return
    update(
      { id: comment.id, content: draft },
      { onSuccess: () => setEditing(false) },
    )
  }

  const handleCancel = () => {
    setDraft(comment.content)
    setEditing(false)
  }

  const handleRemove = () => {
    if (!confirm(t('comments.deleteConfirm'))) return
    remove(comment.id)
  }

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      {/* Avatar */}
      <div className="shrink-0">
        {comment.user?.avatarUrl ? (
          <img
            src={comment.user.avatarUrl}
            alt={comment.user.username}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {comment.user?.username[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {comment.user?.username ?? 'Unknown'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
          {canEdit && !editing && (
            <div className="flex gap-1 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                className="h-6 w-6 p-0 text-muted-foreground"
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="h-6 w-6 p-0 text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isUpdating || !draft.trim()}
              >
                <Check className="w-3 h-3 mr-1" />
                {t('comments.save')}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-3 h-3 mr-1" />
                {t('comments.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
            <Markdown>{comment.content}</Markdown>
          </div>
        )}
      </div>
    </div>
  )
}
