import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  itemsApi,
  type CreateItemPayload,
  type UpdateItemPayload,
} from '@/api/items'

export const itemKeys = {
  all: (inventoryId: string) => ['items', inventoryId] as const,
  detail: (inventoryId: string, itemId: string) =>
    ['items', inventoryId, itemId] as const,
}

export function useItems(inventoryId: string) {
  return useQuery({
    queryKey: itemKeys.all(inventoryId),
    queryFn: () => itemsApi.getAll(inventoryId),
    enabled: !!inventoryId,
  })
}

export function useItem(inventoryId: string, itemId: string) {
  return useQuery({
    queryKey: itemKeys.detail(inventoryId, itemId),
    queryFn: () => itemsApi.getOne(inventoryId, itemId),
    enabled: !!inventoryId && !!itemId,
  })
}

export function useCreateItem(inventoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateItemPayload) => itemsApi.create(inventoryId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.all(inventoryId) })
    },
  })
}

export function useUpdateItem(inventoryId: string, itemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateItemPayload) =>
      itemsApi.update(inventoryId, itemId, data),
    onSuccess: (updated) => {
      qc.setQueryData(itemKeys.detail(inventoryId, itemId), updated)
      qc.invalidateQueries({ queryKey: itemKeys.all(inventoryId) })
    },
  })
}

export function useDeleteItem(inventoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => itemsApi.remove(inventoryId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.all(inventoryId) })
    },
  })
}

export function useBulkDeleteItems(inventoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemIds: string[]) => itemsApi.bulkRemove(inventoryId, itemIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.all(inventoryId) })
    },
  })
}
