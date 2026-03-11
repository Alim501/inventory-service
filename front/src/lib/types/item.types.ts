import type { User } from './user.types'
import type { FieldType } from './inventory.types'

export interface ItemFieldValue {
  fieldId: string
  fieldName: string
  fieldType: FieldType
  textValue: string | null
  numericValue: number | null
  booleanValue: boolean | null
}

export interface Item {
  id: string
  inventoryId: string
  customId: string
  creatorId: string
  version: number
  createdAt: string
  updatedAt: string
  creator?: Pick<User, 'id' | 'username' | 'avatarUrl'>
  fieldValues?: ItemFieldValue[]
  _count?: {
    likes: number
  }
  likedByMe?: boolean
}
