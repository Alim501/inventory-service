import { apiClient } from './client'
import type { User } from '@/lib/types'

export interface TelegramAuthData {
  id: number
  first_name: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export const authApi = {
  me: () => apiClient.get<User>('/auth/me').then((r) => r.data),

  logout: () => apiClient.post('/auth/logout'),

  telegramCallback: (data: TelegramAuthData) =>
    apiClient
      .post<{ accessToken: string }>('/auth/telegram/callback', data)
      .then((r) => r.data),

  // Redirect-based OAuth — просто ссылки, не fetch
  googleLoginUrl: '/api/auth/google',
}
