import type { FieldType } from './types/inventory.types'

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text_single: 'Single-line text',
  text_multi: 'Multi-line text',
  number: 'Number',
  boolean: 'Checkbox',
  image: 'Image URL',
}

export const FIELD_TYPE_LIMITS: Record<FieldType, number> = {
  text_single: 3,
  text_multi: 3,
  number: 3,
  boolean: 3,
  image: 3,
}

export const INVENTORY_CATEGORIES = [
  'Books',
  'Games',
  'Movies',
  'Music',
  'Art',
  'Collectibles',
  'Equipment',
  'Other',
]

export const CUSTOM_ID_ELEMENT_LABELS = {
  fixed: 'Fixed text',
  sequence: 'Sequence (auto)',
  random_20bit: 'Random (20-bit hex)',
  random_32bit: 'Random (32-bit hex)',
  random_6digit: 'Random (6 digits)',
  random_9digit: 'Random (9 digits)',
  guid: 'GUID',
  datetime: 'Date/Time',
} as const
