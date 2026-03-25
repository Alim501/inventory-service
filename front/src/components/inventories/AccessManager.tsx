import { useState } from 'react'
import { Loader2, UserPlus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useGrantAccess,
  useInventoryAccess,
  useRevokeAccess,
} from '@/hooks/useInventories'
import { usersApi } from '@/api/users'

interface Props {
  inventoryId: string
}

export function AccessManager({ inventoryId }: Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: accessList = [], isLoading } = useInventoryAccess(inventoryId)
  const { mutate: grant, isPending: isGranting } = useGrantAccess(inventoryId)
  const { mutate: revoke } = useRevokeAccess(inventoryId)

  const handleGrant = async () => {
    setError(null)
    const trimmed = query.trim()
    if (!trimmed) return

    try {
      const target = await usersApi.searchByUsername(trimmed)
      grant(target.id, {
        onSuccess: () => setQuery(''),
        onError: (e: unknown) => {
          const msg = e instanceof Error ? e.message : t('access.grantFailed')
          setError(msg)
        },
      })
    } catch {
      setError(t('access.userNotFound'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder={t('access.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setError(null)
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleGrant()}
        />
        <Button onClick={handleGrant} disabled={isGranting || !query.trim()}>
          {isGranting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : accessList.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('access.noShared')}</p>
      ) : (
        <ul className="space-y-2">
          {accessList.map((entry) => (
            <li
              key={entry.userId}
              className="flex items-center justify-between text-sm border border-border rounded-lg px-3 py-2"
            >
              <div>
                <span className="font-medium">{entry.user.username}</span>
                {entry.user.email && (
                  <span className="text-muted-foreground ml-2">
                    {entry.user.email}
                  </span>
                )}
              </div>
              <button
                onClick={() => revoke(entry.userId)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
