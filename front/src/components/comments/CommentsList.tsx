import { MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { useComments } from '@/hooks/useComments'
import { useAuthStore } from '@/store/auth.store'

interface CommentsListProps {
  inventoryId: string
}

export function CommentsList({ inventoryId }: CommentsListProps) {
  const { t } = useTranslation()
  const { data: comments = [], isLoading } = useComments(inventoryId)
  const { user } = useAuthStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        <h3 className="font-semibold">
          {t('comments.title')}{comments.length > 0 ? ` (${comments.length})` : ''}
        </h3>
      </div>

      {user && <CommentForm inventoryId={inventoryId} />}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-24 animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {user ? t('comments.firstComment') : t('comments.noComments')}
        </p>
      )}

      {!isLoading && comments.length > 0 && (
        <div className="border border-border rounded-xl px-4 divide-y divide-border">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              inventoryId={inventoryId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
