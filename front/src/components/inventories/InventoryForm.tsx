import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { INVENTORY_CATEGORIES } from '@/lib/constants'
import { FieldsEditor } from './FieldsEditor'
import { CustomIdBuilder } from './CustomIdBuilder'
import { TagsInput } from '@/components/tags/TagsInput'
import type { Inventory, Tag } from '@/lib/types'
import type { CreateInventoryPayload } from '@/api/inventories'

const fieldSchema = z.object({
  fieldName: z.string().min(1, 'Required'),
  fieldType: z.enum(['text_single', 'text_multi', 'number', 'boolean', 'image']),
  fieldOrder: z.number(),
  description: z.string().optional(),
  showInTable: z.boolean(),
})

const customIdElementSchema = z.object({
  type: z.enum([
    'fixed', 'sequence', 'random_20bit', 'random_32bit',
    'random_6digit', 'random_9digit', 'guid', 'datetime',
  ]),
  value: z.string().optional(),
  format: z.string().optional(),
})

const inventorySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  isPublic: z.boolean(),
  fields: z.array(fieldSchema),
  customIdFormat: z.object({
    elements: z.array(customIdElementSchema),
  }),
})

export type InventoryFormValues = z.infer<typeof inventorySchema>

interface InventoryFormProps {
  defaultValues?: Partial<Inventory>
  onSubmit: (data: CreateInventoryPayload, tags: Tag[]) => void
  isLoading?: boolean
  submitLabel?: string
}

export function InventoryForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Save',
}: InventoryFormProps) {
  const [tags, setTags] = useState<Tag[]>(defaultValues?.tags ?? [])

  const methods = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      category: defaultValues?.category ?? '',
      isPublic: defaultValues?.isPublic ?? false,
      fields: defaultValues?.fields?.map((f) => ({
        fieldName: f.fieldName,
        fieldType: f.fieldType,
        fieldOrder: f.fieldOrder,
        description: f.description ?? '',
        showInTable: f.showInTable,
      })) ?? [],
      customIdFormat: {
        elements: defaultValues?.customIdFormat?.elements ?? [],
      },
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods

  const handleFormSubmit = (values: InventoryFormValues) => {
    const payload: CreateInventoryPayload = {
      title: values.title,
      description: values.description || undefined,
      category: values.category || undefined,
      isPublic: values.isPublic,
      fields: values.fields.map((f, i) => ({ ...f, fieldOrder: i })),
      customIdFormat:
        values.customIdFormat.elements.length > 0
          ? values.customIdFormat
          : undefined,
    }
    onSubmit(payload, tags)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic info */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title *</label>
            <Input placeholder="My Collection" {...register('title')} />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="What is this inventory about?"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('category')}
              >
                <option value="">— None —</option>
                {INVENTORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded"
                  {...register('isPublic')}
                />
                Public inventory
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tags</label>
            <TagsInput value={tags} onChange={setTags} />
          </div>
        </div>

        <hr className="border-border" />

        {/* Fields editor */}
        <FieldsEditor />

        <hr className="border-border" />

        {/* Custom ID builder */}
        <CustomIdBuilder />

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
