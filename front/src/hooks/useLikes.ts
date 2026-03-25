import { useMutation, useQueryClient } from '@tanstack/react-query'
import { itemKeys } from './useItems'
import { likesApi } from '@/api/likes'

export function useToggleLike(inventoryId: string, itemId: string) {
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: itemKeys.all(inventoryId) })
    qc.invalidateQueries({ queryKey: itemKeys.detail(inventoryId, itemId) })
  }

  const like = useMutation({
    mutationFn: () => likesApi.like(itemId),
    onSuccess: invalidate,
  })

  const unlike = useMutation({
    mutationFn: () => likesApi.unlike(itemId),
    onSuccess: invalidate,
  })

  return { like, unlike }
}
