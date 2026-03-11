import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CUSTOM_ID_ELEMENT_LABELS } from '@/lib/constants'
import type { CustomIdElementType } from '@/lib/types/inventory.types'
import type { InventoryFormValues } from './InventoryForm'

const ELEMENT_TYPES = Object.keys(CUSTOM_ID_ELEMENT_LABELS) as CustomIdElementType[]

// Preview: generates sample custom ID from current elements
function previewCustomId(
  elements: { type: CustomIdElementType; value?: string; format?: string }[],
): string {
  return elements
    .map((el) => {
      switch (el.type) {
        case 'fixed':
          return el.value ?? '?'
        case 'sequence':
          return el.format === 'D3' ? '001' : el.format === 'D4' ? '0001' : '1'
        case 'random_20bit':
          return 'A7E3B'
        case 'random_32bit':
          return 'A7E3B9C2'
        case 'random_6digit':
          return '482931'
        case 'random_9digit':
          return '482931057'
        case 'guid':
          return 'xxxxxxxx'
        case 'datetime':
          return el.format
            ? new Date().toISOString().slice(0, 10).replace(/-/g, el.format.includes('MM') ? '' : '-')
            : '2025'
        default:
          return '?'
      }
    })
    .join('')
}

export function CustomIdBuilder() {
  const { register, watch } = useFormContext<InventoryFormValues>()
  const { fields, append, remove, move } = useFieldArray<InventoryFormValues, 'customIdFormat.elements'>({
    name: 'customIdFormat.elements',
  })

  const watchedElements = watch('customIdFormat.elements') ?? []
  const preview = previewCustomId(
    watchedElements.map((el, i) => ({ ...el, ...watchedElements[i] })),
  )

  const addElement = (type: CustomIdElementType) => {
    append({ type, value: '', format: '' })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Custom ID Format</h3>
        <span className="text-xs text-muted-foreground">
          Preview:{' '}
          <code className="px-1.5 py-0.5 bg-muted rounded text-foreground">
            {preview || 'empty'}
          </code>
        </span>
      </div>

      <div className="flex gap-1 flex-wrap">
        {ELEMENT_TYPES.map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addElement(type)}
            className="text-xs h-7"
          >
            <Plus className="w-3 h-3 mr-1" />
            {CUSTOM_ID_ELEMENT_LABELS[type]}
          </Button>
        ))}
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
          No elements. IDs will be UUID by default.
        </p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => {
          const type = watchedElements[index]?.type
          return (
            <div
              key={field.id}
              className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/30"
            >
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0 w-36 text-center">
                {CUSTOM_ID_ELEMENT_LABELS[type]}
              </span>

              {type === 'fixed' && (
                <Input
                  placeholder="Text (e.g. BOOK- or 🎯)"
                  className="h-7 text-xs"
                  {...register(`customIdFormat.elements.${index}.value`)}
                />
              )}
              {type === 'sequence' && (
                <Input
                  placeholder="Format: D3 (001), D4 (0001)"
                  className="h-7 text-xs"
                  {...register(`customIdFormat.elements.${index}.format`)}
                />
              )}
              {type === 'datetime' && (
                <Input
                  placeholder="Format: yyyy, MM, dd, HH, mm"
                  className="h-7 text-xs"
                  {...register(`customIdFormat.elements.${index}.format`)}
                />
              )}

              <div className="flex gap-1 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="h-6 w-6 p-0 text-muted-foreground"
                >
                  ←
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="h-6 w-6 p-0 text-muted-foreground"
                >
                  →
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
