import { apiClient } from './client'
import type { Item } from '@/lib/types'

export interface CreateItemFieldValuePayload {
  fieldId: string
  textValue?: string
  numericValue?: number
  booleanValue?: boolean
}

export interface CreateItemPayload {
  customId?: string
  fieldValues?: Array<CreateItemFieldValuePayload>
}

export interface UpdateItemPayload {
  version: number
  customId?: string
  fieldValues?: Array<CreateItemFieldValuePayload>
}

export const itemsApi = {
  getAll: (inventoryId: string) =>
    apiClient
      .get<Array<Item>>(`/inventories/${inventoryId}/items`)
      .then((r) => r.data),

  getOne: (inventoryId: string, itemId: string) =>
    apiClient
      .get<Item>(`/inventories/${inventoryId}/items/${itemId}`)
      .then((r) => r.data),

  create: (inventoryId: string, data: CreateItemPayload) =>
    apiClient
      .post<Item>(`/inventories/${inventoryId}/items`, data)
      .then((r) => r.data),

  update: (inventoryId: string, itemId: string, data: UpdateItemPayload) =>
    apiClient
      .patch<Item>(`/inventories/${inventoryId}/items/${itemId}`, data)
      .then((r) => r.data),

  remove: (inventoryId: string, itemId: string) =>
    apiClient.delete(`/inventories/${inventoryId}/items/${itemId}`),

  bulkRemove: (inventoryId: string, itemIds: Array<string>) =>
    apiClient.delete(`/inventories/${inventoryId}/items`, {
      data: { ids: itemIds },
    }),
}
