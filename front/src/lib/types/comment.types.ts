import type { User } from './user.types'

export interface Comment {
  id: string
  inventoryId: string
  userId: string
  content: string
  createdAt: string
  user?: Pick<User, 'id' | 'username' | 'avatarUrl'>
}
