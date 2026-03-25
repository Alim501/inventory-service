import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CreateSupportTicketPayload, SupportTicketPriority } from '@/api/support'
import { useCreateSupportTicket } from '@/hooks/useSupport'

interface Props {
  onClose: () => void
}

export function SupportTicketModal({ onClose }: Props) {
  const { t } = useTranslation()
  const { mutate: createTicket, isPending } = useCreateSupportTicket()
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<CreateSupportTicketPayload>({
    defaultValues: {
      pageLink: typeof window !== 'undefined' ? window.location.href : '',
      priority: 'Average',
    },
  })

  const onSubmit = (data: CreateSupportTicketPayload) => {
    createTicket(data, {
      onSuccess: () => setSubmitted(true),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-background border border-border rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('support.title')}</h2>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">{t('support.submitted')}</p>
            <Button className="mt-4" onClick={onClose}>{t('common.cancel')}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('support.summary')}</label>
              <Input
                {...register('summary', { required: true })}
                placeholder={t('support.summaryPlaceholder')}
                className={errors.summary ? 'border-destructive' : ''}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t('support.priority')}</label>
              <select
                {...register('priority', { required: true })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {(['High', 'Average', 'Low'] as SupportTicketPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {t(`support.priority_${p}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t('support.pageLink')}</label>
              <Input
                {...register('pageLink', { required: true })}
                placeholder="https://..."
                className={errors.pageLink ? 'border-destructive' : ''}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t('support.inventoryTitle')}</label>
              <Input
                {...register('inventoryTitle')}
                placeholder={t('support.inventoryTitlePlaceholder')}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t('common.loading') : t('support.submit')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
