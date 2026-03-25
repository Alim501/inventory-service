import { Link, createFileRoute } from '@tanstack/react-router'
import { Package, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/layout/PageLayout'
import { useAuthStore } from '@/store/auth.store'
import { useAllUsers } from '@/hooks/useAdmin'
import { usePublicInventories } from '@/hooks/useInventories'

export const Route = createFileRoute('/admin/')({
  beforeLoad: ({ context }) => {},
  component: AdminDashboard,
})

function AdminDashboard() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: users = [] } = useAllUsers()
  const { data: inventories = [] } = usePublicInventories()

  if (!user?.isAdmin) {
    return (
      <PageLayout>
        <p className="text-muted-foreground text-sm">
          {t('common.accessDenied')}
        </p>
      </PageLayout>
    )
  }

  const blockedCount = users.filter((u) => u.isBlocked).length
  const adminCount = users.filter((u) => u.isAdmin).length

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold mb-8">{t('admin.title')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          label={t('admin.totalUsers')}
          value={users.length}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label={t('admin.admins')}
          value={adminCount}
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label={t('admin.blocked')}
          value={blockedCount}
          icon={<Users className="w-5 h-5 text-destructive" />}
        />
        <StatCard
          label={t('admin.inventories')}
          value={inventories.length}
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      <div className="flex gap-4">
        <Link
          to="/admin/users"
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium"
        >
          <Users className="w-4 h-4" />
          {t('admin.manageUsers')}
        </Link>
      </div>
    </PageLayout>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="border border-border rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
