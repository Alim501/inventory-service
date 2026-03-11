import { apiClient } from './client'
import type { Comment } from '@/lib/types'

export const commentsApi = {
  getForInventory: (inventoryId: string) =>
    apiClient
      .get<Comment[]>('/comments', { params: { inventoryId } })
      .then((r) => r.data),

  create: (inventoryId: string, content: string) =>
    apiClient
      .post<Comment>('/comments', { inventoryId, content })
      .then((r) => r.data),

  update: (id: string, content: string) =>
    apiClient
      .patch<Comment>(`/comments/${id}`, { content })
      .then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/comments/${id}`),
}
