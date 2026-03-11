import { apiClient } from './client'
import type { Inventory } from '@/lib/types'
import type { CustomIdFormat, FieldType } from '@/lib/types/inventory.types'

export interface CreateInventoryFieldPayload {
  fieldName: string
  fieldType: FieldType
  fieldOrder: number
  description?: string
  showInTable: boolean
}

export interface CreateInventoryPayload {
  title: string
  description?: string
  category?: string
  isPublic: boolean
  customIdFormat?: CustomIdFormat
  fields?: CreateInventoryFieldPayload[]
  tagIds?: string[]
}

export interface UpdateInventoryPayload extends Partial<CreateInventoryPayload> {
  version: number
}

export const inventoriesApi = {
  getPublic: () =>
    apiClient.get<Inventory[]>('/inventories').then((r) => r.data),

  getMine: () =>
    apiClient.get<Inventory[]>('/inventories/my').then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<Inventory>(`/inventories/${id}`).then((r) => r.data),

  create: (data: CreateInventoryPayload) =>
    apiClient.post<Inventory>('/inventories', data).then((r) => r.data),

  update: (id: string, data: UpdateInventoryPayload) =>
    apiClient.patch<Inventory>(`/inventories/${id}`, data).then((r) => r.data),

  remove: (id: string, version: number) =>
    apiClient.delete(`/inventories/${id}`, { data: { version } }),
}
