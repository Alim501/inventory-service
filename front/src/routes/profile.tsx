import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageLayout } from '@/components/layout/PageLayout'
import { useAuthStore } from '@/store/auth.store'
import { useUpdateProfile } from '@/hooks/useAdmin'

export const Route = createFileRoute('/profile')({ component: ProfilePage })

interface ProfileForm {
  username: string
  email: string
}

function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { mutate: update, isPending, isSuccess } = useUpdateProfile()

  const { register, handleSubmit } = useForm<ProfileForm>({
    defaultValues: {
      username: user?.username ?? '',
      email: user?.email ?? '',
    },
  })

  if (!user) {
    return (
      <PageLayout className="max-w-md">
        <p className="text-muted-foreground text-sm">
          {t('profile.pleaseSignIn')}
        </p>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="max-w-md">
      <div className="flex items-center gap-4 mb-8">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-xl font-semibold">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{user.username}</h1>
          {user.email && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
          {user.isAdmin && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Admin
            </span>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => update(data))}
        className="space-y-4"
      >
        <div>
          <label className="text-sm font-medium mb-1 block">
            {t('profile.username')}
          </label>
          <Input {...register('username')} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            {t('profile.email')}
          </label>
          <Input type="email" {...register('email')} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('common.save')}
          </Button>
          {isSuccess && (
            <span className="text-sm text-green-600">{t('common.saved')}</span>
          )}
        </div>
      </form>
    </PageLayout>
  )
}
