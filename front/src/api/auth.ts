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

  login: (email: string, password: string) =>
    apiClient
      .post<{ accessToken: string }>('/auth/login', {
        authMethod: 'password',
        email,
        password,
      })
      .then((r) => r.data),

  register: (username: string, email: string, password: string) =>
    apiClient
      .post<{ accessToken: string }>('/auth/register', {
        authMethod: 'password',
        username,
        email,
        password,
      })
      .then((r) => r.data),

  googleLoginUrl: `${import.meta.env.VITE_API_URL}api/auth/google`,
}
