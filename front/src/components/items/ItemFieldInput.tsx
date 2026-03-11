import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import type { InventoryField } from '@/lib/types'
import type { ItemFormValues } from './ItemForm'

interface ItemFieldInputProps {
  field: InventoryField
  index: number
}

export function ItemFieldInput({ field, index }: ItemFieldInputProps) {
  const { register } = useFormContext<ItemFormValues>()

  const base = `fieldValues.${index}`

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {field.fieldName}
        {field.description && (
          <span className="ml-1 text-xs text-muted-foreground font-normal">
            — {field.description}
          </span>
        )}
      </label>

      {(field.fieldType === 'text_single' || field.fieldType === 'image') && (
        <Input
          placeholder={field.fieldType === 'image' ? 'https://...' : ''}
          {...register(`${base}.textValue`)}
        />
      )}

      {field.fieldType === 'text_multi' && (
        <textarea
          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register(`${base}.textValue`)}
        />
      )}

      {field.fieldType === 'number' && (
        <Input
          type="number"
          step="any"
          {...register(`${base}.numericValue`, { valueAsNumber: true })}
        />
      )}

      {field.fieldType === 'boolean' && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            {...register(`${base}.booleanValue`)}
          />
          Yes
        </label>
      )}

      {/* Hidden field for fieldId */}
      <input type="hidden" value={field.id} {...register(`${base}.fieldId`)} />
    </div>
  )
}
