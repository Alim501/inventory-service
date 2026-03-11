import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FIELD_TYPE_LABELS, FIELD_TYPE_LIMITS } from '@/lib/constants'
import type { FieldType } from '@/lib/types/inventory.types'
import type { InventoryFormValues } from './InventoryForm'

const FIELD_TYPES = Object.keys(FIELD_TYPE_LABELS) as FieldType[]

export function FieldsEditor() {
  const { register, watch, formState: { errors } } = useFormContext<InventoryFormValues>()
  const { fields, append, remove, move } = useFieldArray<InventoryFormValues, 'fields'>({
    name: 'fields',
  })

  const watchedFields = watch('fields') ?? []

  const countByType = (type: FieldType) =>
    watchedFields.filter((f) => f.fieldType === type).length

  const canAdd = (type: FieldType) =>
    countByType(type) < FIELD_TYPE_LIMITS[type]

  const addField = (type: FieldType) => {
    if (!canAdd(type)) return
    append({
      fieldName: '',
      fieldType: type,
      fieldOrder: fields.length,
      description: '',
      showInTable: true,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Custom Fields</h3>
        <div className="flex gap-1 flex-wrap justify-end">
          {FIELD_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant="outline"
              size="sm"
              disabled={!canAdd(type)}
              onClick={() => addField(type)}
              className="text-xs h-7"
            >
              <Plus className="w-3 h-3 mr-1" />
              {FIELD_TYPE_LABELS[type]}
              <span className="ml-1 text-muted-foreground">
                {countByType(type)}/{FIELD_TYPE_LIMITS[type]}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
          No fields yet. Add fields using the buttons above.
        </p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-start gap-2 p-3 border border-border rounded-lg bg-muted/30"
          >
            <button
              type="button"
              className="mt-2 cursor-grab text-muted-foreground hover:text-foreground"
              onMouseDown={(e) => {
                // drag-and-drop simplified via up/down for now
                e.preventDefault()
              }}
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                  {FIELD_TYPE_LABELS[watchedFields[index]?.fieldType]}
                </span>
                <Input
                  placeholder="Field name"
                  className="h-8 text-sm"
                  {...register(`fields.${index}.fieldName`)}
                />
              </div>
              <Input
                placeholder="Description (optional)"
                className="h-8 text-xs col-span-2"
                {...register(`fields.${index}.description`)}
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  {...register(`fields.${index}.showInTable`)}
                  className="rounded"
                />
                Show in table
              </label>
            </div>

            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                className="h-7 w-7 p-0 text-muted-foreground"
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                className="h-7 w-7 p-0 text-muted-foreground"
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="h-7 w-7 p-0 text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
