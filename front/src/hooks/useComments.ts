import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '@/api/comments'

export const commentKeys = {
  forInventory: (inventoryId: string) => ['comments', inventoryId] as const,
}

export function useComments(inventoryId: string) {
  return useQuery({
    queryKey: commentKeys.forInventory(inventoryId),
    queryFn: () => commentsApi.getForInventory(inventoryId),
    enabled: !!inventoryId,
    refetchInterval: 3000,
  })
}

export function useCreateComment(inventoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => commentsApi.create(inventoryId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.forInventory(inventoryId) })
    },
  })
}

export function useUpdateComment(inventoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentsApi.update(id, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.forInventory(inventoryId) })
    },
  })
}

export function useDeleteComment(inventoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => commentsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.forInventory(inventoryId) })
    },
  })
}
