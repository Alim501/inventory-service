import { apiClient } from './client'
import type { User } from '@/lib/types'

export interface UpdateProfilePayload {
  username?: string
  email?: string
  preferredLanguage?: string
  preferredTheme?: string
}

export interface UpdateUserAdminPayload {
  isAdmin?: boolean
  isBlocked?: boolean
  preferredLanguage?: string
  preferredTheme?: string
}

export const usersApi = {
  getAll: () => apiClient.get<Array<User>>('/users').then((r) => r.data),

  searchByUsername: (username: string) =>
    apiClient
      .get<{ id: string; username: string }>('/users/search', {
        params: { username },
      })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),

  updateAdmin: (id: string, data: UpdateUserAdminPayload) =>
    apiClient.patch<User>(`/users/${id}`, data).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/users/${id}`),

  getMe: () => apiClient.get<User>('/users/me').then((r) => r.data),

  updateMe: (data: UpdateProfilePayload) =>
    apiClient.patch<User>('/users/me', data).then((r) => r.data),
}
