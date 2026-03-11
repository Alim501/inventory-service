import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToggleLike } from '@/hooks/useLikes'
import { useAuthStore } from '@/store/auth.store'

interface LikeButtonProps {
  inventoryId: string
  itemId: string
  likedByMe: boolean
  count: number
}

export function LikeButton({
  inventoryId,
  itemId,
  likedByMe,
  count,
}: LikeButtonProps) {
  const { user } = useAuthStore()
  const { like, unlike } = useToggleLike(inventoryId, itemId)

  const isPending = like.isPending || unlike.isPending

  const handleClick = () => {
    if (!user) return
    if (likedByMe) {
      unlike.mutate()
    } else {
      like.mutate()
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending || !user}
      className={`gap-1.5 ${likedByMe ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
    >
      <Heart
        className="w-4 h-4"
        fill={likedByMe ? 'currentColor' : 'none'}
      />
      <span className="text-xs">{count}</span>
    </Button>
  )
}
