export interface User {
  id: string
  email: string
  username: string
  avatarUrl: string | null
  isAdmin: boolean
  isBlocked: boolean
  preferredLanguage: string
  preferredTheme: string
  createdAt: string
  updatedAt: string
}
