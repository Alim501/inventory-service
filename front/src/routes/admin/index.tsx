import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { Users, Package } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { useAuthStore } from '@/store/auth.store'
import { useAllUsers } from '@/hooks/useAdmin'
import { usePublicInventories } from '@/hooks/useInventories'

export const Route = createFileRoute('/admin/')({
  beforeLoad: ({ context }) => {
    // guard будет работать после routeTree генерации
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  const { user } = useAuthStore()
  const { data: users = [] } = useAllUsers()
  const { data: inventories = [] } = usePublicInventories()

  // Client-side guard
  if (!user?.isAdmin) {
    return (
      <PageLayout>
        <p className="text-muted-foreground text-sm">Access denied.</p>
      </PageLayout>
    )
  }

  const blockedCount = users.filter((u) => u.isBlocked).length
  const adminCount = users.filter((u) => u.isAdmin).length

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Users" value={users.length} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Admins" value={adminCount} icon={<Users className="w-5 h-5 text-primary" />} />
        <StatCard label="Blocked" value={blockedCount} icon={<Users className="w-5 h-5 text-destructive" />} />
        <StatCard label="Inventories" value={inventories.length} icon={<Package className="w-5 h-5" />} />
      </div>

      <div className="flex gap-4">
        <Link
          to="/admin/users"
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors text-sm font-medium"
        >
          <Users className="w-4 h-4" />
          Manage Users
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
