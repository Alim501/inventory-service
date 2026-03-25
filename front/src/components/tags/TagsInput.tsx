import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Tag } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { tagsApi } from '@/api/tags'
import { useCreateTag } from '@/hooks/useTags'

interface TagsInputProps {
  value: Array<Tag>
  onChange: (tags: Array<Tag>) => void
}

export function TagsInput({ value, onChange }: TagsInputProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Array<Tag>>([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate: createTag } = useCreateTag()

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      const results = await tagsApi.search(query.trim())
      setSuggestions(results.filter((t) => !value.some((v) => v.id === t.id)))
    }, 250)
    return () => clearTimeout(timer)
  }, [query, value])

  const addTag = (tag: Tag) => {
    onChange([...value, tag])
    setQuery('')
    setSuggestions([])
    setOpen(false)
    inputRef.current?.focus()
  }

  const removeTag = (id: string) => {
    onChange(value.filter((t) => t.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault()
      const exact = suggestions.find(
        (t) => t.name.toLowerCase() === query.trim().toLowerCase(),
      )
      if (exact) {
        addTag(exact)
      } else {
        createTag(query.trim(), { onSuccess: (tag) => addTag(tag) })
      }
    }
    if (e.key === 'Backspace' && !query && value.length > 0) {
      removeTag(value[value.length - 1].id)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  const exactMatch = suggestions.some(
    (t) => t.name.toLowerCase() === query.trim().toLowerCase(),
  )

  return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-1.5 min-h-9 px-2 py-1.5 rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag.id)
              }}
              className="hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? t('tags.placeholder') : ''}
          className="border-0 shadow-none focus-visible:ring-0 h-6 px-0 text-sm flex-1 min-w-[100px]"
        />
      </div>

      {open && query.trim() && (suggestions.length > 0 || !exactMatch) && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-md overflow-hidden">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onMouseDown={() => addTag(tag)}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
            >
              {tag.name}
            </button>
          ))}
          {!exactMatch && (
            <button
              type="button"
              onMouseDown={() =>
                createTag(query.trim(), { onSuccess: (tag) => addTag(tag) })
              }
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent text-muted-foreground"
            >
              {t('tags.create', { query: query.trim() })}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
