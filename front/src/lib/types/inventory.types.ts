import type { User } from './user.types'
import type { Tag } from './tag.types'

export type FieldType =
  | 'text_single'
  | 'text_multi'
  | 'number'
  | 'boolean'
  | 'image'

export interface InventoryField {
  id: string
  inventoryId: string
  fieldName: string
  fieldType: FieldType
  fieldOrder: number
  description: string | null
  showInTable: boolean
  createdAt: string
}

export type CustomIdElementType =
  | 'fixed'
  | 'sequence'
  | 'random_20bit'
  | 'random_32bit'
  | 'random_6digit'
  | 'random_9digit'
  | 'guid'
  | 'datetime'

export interface CustomIdElement {
  type: CustomIdElementType
  value?: string
  format?: string
}

export interface CustomIdFormat {
  elements: Array<CustomIdElement>
}

export interface InventoryAccess {
  inventoryId: string
  userId: string
  user: {
    id: string
    username: string
    email: string | null
  }
}

export interface Inventory {
  id: string
  creatorId: string
  title: string
  description: string | null
  category: string | null
  imageUrl: string | null
  isPublic: boolean
  customIdFormat: CustomIdFormat | null
  apiToken: string | null
  version: number
  createdAt: string
  updatedAt: string
  creator?: Pick<User, 'id' | 'username' | 'avatarUrl'>
  fields?: Array<InventoryField>
  tags?: Array<Tag>
  accessUsers?: Array<{ userId: string }>
  _count?: {
    items: number
    comments: number
  }
}
