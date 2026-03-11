import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoriesApi, type CreateInventoryPayload, type UpdateInventoryPayload } from '@/api/inventories'

export const inventoryKeys = {
  all: ['inventories'] as const,
  public: () => [...inventoryKeys.all, 'public'] as const,
  mine: () => [...inventoryKeys.all, 'mine'] as const,
  detail: (id: string) => [...inventoryKeys.all, id] as const,
}

export function usePublicInventories() {
  return useQuery({
    queryKey: inventoryKeys.public(),
    queryFn: inventoriesApi.getPublic,
  })
}

export function useMyInventories() {
  return useQuery({
    queryKey: inventoryKeys.mine(),
    queryFn: inventoriesApi.getMine,
  })
}

export function useInventory(id: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoriesApi.getOne(id),
    enabled: !!id,
  })
}

export function useCreateInventory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInventoryPayload) => inventoriesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}

export function useUpdateInventory(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateInventoryPayload) => inventoriesApi.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(inventoryKeys.detail(id), updated)
      qc.invalidateQueries({ queryKey: inventoryKeys.mine() })
    },
  })
}

export function useDeleteInventory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      inventoriesApi.remove(id, version),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}
