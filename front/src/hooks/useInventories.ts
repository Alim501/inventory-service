import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/lib/types'
import type {
  CreateInventoryPayload,
  UpdateInventoryPayload,
} from '@/api/inventories'
import { inventoriesApi } from '@/api/inventories'

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
    mutationFn: (data: UpdateInventoryPayload) =>
      inventoriesApi.update(id, data),
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

const accessKeys = {
  list: (inventoryId: string) =>
    ['inventories', inventoryId, 'access'] as const,
}

export function useInventoryAccess(inventoryId: string) {
  return useQuery({
    queryKey: accessKeys.list(inventoryId),
    queryFn: () => inventoriesApi.listAccess(inventoryId),
  })
}

export function useGrantAccess(inventoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      inventoriesApi.grantAccess(inventoryId, userId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: accessKeys.list(inventoryId) }),
  })
}

export function useRevokeAccess(inventoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      inventoriesApi.revokeAccess(inventoryId, userId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: accessKeys.list(inventoryId) }),
  })
}

export function useGenerateApiToken(inventoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => inventoriesApi.generateApiToken(inventoryId),
    onSuccess: (data) => {
      qc.setQueryData(inventoryKeys.detail(inventoryId), (old: any) =>
        old ? { ...old, apiToken: data.apiToken } : old,
      )
    },
  })
}

export function useCanManageInventory(
  inventory: { creatorId: string } | undefined,
  user: User | null,
) {
  if (!inventory || !user) return false
  return user.isAdmin || inventory.creatorId === user.id
}
