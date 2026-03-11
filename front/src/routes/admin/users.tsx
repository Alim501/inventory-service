import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PageLayout } from '@/components/layout/PageLayout'
import { UsersTable } from '@/components/admin/UsersTable'
import { useAuthStore } from '@/store/auth.store'

export const Route = createFileRoute('/admin/users')({ component: AdminUsersPage })

function AdminUsersPage() {
  const { user } = useAuthStore()

  if (!user?.isAdmin) {
    return (
      <PageLayout>
        <p className="text-muted-foreground text-sm">Access denied.</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <UsersTable />
    </PageLayout>
  )
}
