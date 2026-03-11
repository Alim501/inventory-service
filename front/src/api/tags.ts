import { apiClient } from './client'
import type { Tag } from '@/lib/types'

export const tagsApi = {
  getAll: () => apiClient.get<Tag[]>('/tags').then((r) => r.data),

  create: (name: string) =>
    apiClient.post<Tag>('/tags', { name }).then((r) => r.data),
}
