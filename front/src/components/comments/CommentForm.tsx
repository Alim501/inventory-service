import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateComment } from '@/hooks/useComments'

interface CommentFormProps {
  inventoryId: string
}

export function CommentForm({ inventoryId }: CommentFormProps) {
  const [content, setContent] = useState('')
  const { mutate: create, isPending } = useCreateComment(inventoryId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    create(content, { onSuccess: () => setContent('') })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment... (Markdown supported)"
        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          Post Comment
        </Button>
      </div>
    </form>
  )
}
