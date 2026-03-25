import { FormProvider, useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ItemFieldInput } from './ItemFieldInput'
import type { InventoryField, Item } from '@/lib/types'
import type { CreateItemPayload } from '@/api/items'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FieldValueForm {
  fieldId: string
  textValue?: string
  numericValue?: number
  booleanValue?: boolean
}

export interface ItemFormValues {
  customId?: string
  fieldValues: Array<FieldValueForm>
}

interface ItemFormProps {
  fields: Array<InventoryField>
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
  submitLabel,
}: ItemFormProps) {
  const { t } = useTranslation()
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
              {t('items.customId')}
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                {t('items.customIdPlaceholder')}
              </span>
            </label>
            <Input
              placeholder={t('items.customIdExample')}
              {...register('customId')}
            />
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
            {t('items.noFields')}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitLabel ?? t('common.save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
