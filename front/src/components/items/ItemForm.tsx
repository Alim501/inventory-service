import { useForm, FormProvider } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ItemFieldInput } from './ItemFieldInput'
import type { InventoryField, Item } from '@/lib/types'
import type { CreateItemPayload } from '@/api/items'

interface FieldValueForm {
  fieldId: string
  textValue?: string
  numericValue?: number
  booleanValue?: boolean
}

export interface ItemFormValues {
  customId?: string
  fieldValues: FieldValueForm[]
}

interface ItemFormProps {
  fields: InventoryField[]
  defaultValues?: Item
  hasCustomIdFormat: boolean
  onSubmit: (data: CreateItemPayload) => void
  isLoading?: boolean
  submitLabel?: string
}

export function ItemForm({
  fields,
  defaultValues,
  hasCustomIdFormat,
  onSubmit,
  isLoading,
  submitLabel = 'Save',
}: ItemFormProps) {
  const methods = useForm<ItemFormValues>({
    defaultValues: {
      customId: defaultValues?.customId ?? '',
      fieldValues: fields.map((f) => {
        const existing = defaultValues?.fieldValues?.find(
          (v) => v.fieldId === f.id,
        )
        return {
          fieldId: f.id,
          textValue: existing?.textValue ?? '',
          numericValue: existing?.numericValue ?? undefined,
          booleanValue: existing?.booleanValue ?? false,
        }
      }),
    },
  })

  const { register, handleSubmit } = methods

  const handleFormSubmit = (values: ItemFormValues) => {
    const payload: CreateItemPayload = {
      customId: values.customId || undefined,
      fieldValues: values.fieldValues.map((fv) => {
        const field = fields.find((f) => f.id === fv.fieldId)!
        // only send the relevant value for the field type
        if (field.fieldType === 'number') {
          return { fieldId: fv.fieldId, numericValue: fv.numericValue }
        }
        if (field.fieldType === 'boolean') {
          return { fieldId: fv.fieldId, booleanValue: fv.booleanValue }
        }
        return { fieldId: fv.fieldId, textValue: fv.textValue }
      }),
    }
    onSubmit(payload)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Custom ID — only if inventory doesn't have auto-format */}
        {!hasCustomIdFormat && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Custom ID
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                (leave empty to auto-generate)
              </span>
            </label>
            <Input placeholder="e.g. BOOK-001" {...register('customId')} />
          </div>
        )}

        {fields.length > 0 && (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <ItemFieldInput key={field.id} field={field} index={index} />
            ))}
          </div>
        )}

        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            This inventory has no custom fields.
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
