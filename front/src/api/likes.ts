import { apiClient } from './client'

export const likesApi = {
  like: (itemId: string) =>
    apiClient.post('/likes', { itemId }).then((r) => r.data),

  unlike: (itemId: string) =>
    apiClient.delete(`/likes/${itemId}`),
}
