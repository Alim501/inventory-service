import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Ban, Check, Shield, ShieldOff, Trash2 } from 'lucide-react'
import type { User } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  useAllUsers,
  useDeleteUser,
  useUpdateUserAdmin,
} from '@/hooks/useAdmin'
import { useAuthStore } from '@/store/auth.store'

const columnHelper = createColumnHelper<User>()

export function UsersTable() {
  const { data: users = [], isLoading } = useAllUsers()
  const { user: currentUser } = useAuthStore()

  const table = useReactTable({
    data: users,
    columns: [
      columnHelper.accessor('avatarUrl', {
        header: '',
        cell: (info) =>
          info.getValue() ? (
            <img
              src={info.getValue()}
              alt=""
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs">
              {info.row.original.username[0].toUpperCase()}
            </div>
          ),
        size: 40,
      }),
      columnHelper.accessor('username', {
        header: 'Username',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('isAdmin', {
        header: 'Admin',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              <Shield className="w-3 h-3" /> Admin
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">User</span>
          ),
      }),
      columnHelper.accessor('isBlocked', {
        header: 'Status',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
              <Ban className="w-3 h-3" /> Blocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
              <Check className="w-3 h-3" /> Active
            </span>
          ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Joined',
        cell: (info) => (
          <span className="text-xs text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <UserActions user={row.original} currentUserId={currentUser?.id} />
        ),
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function UserActions({
  user,
  currentUserId,
}: {
  user: User
  currentUserId?: string
}) {
  const { mutate: update, isPending: isUpdating } = useUpdateUserAdmin(user.id)
  const { mutate: remove, isPending: isRemoving } = useDeleteUser()

  const isSelf = user.id === currentUserId

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={isUpdating || isSelf}
        onClick={() => update({ isAdmin: !user.isAdmin })}
        className="h-7 px-2 text-xs"
        title={user.isAdmin ? 'Remove admin' : 'Make admin'}
      >
        {user.isAdmin ? (
          <ShieldOff className="w-3.5 h-3.5" />
        ) : (
          <Shield className="w-3.5 h-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={isUpdating || isSelf}
        onClick={() => update({ isBlocked: !user.isBlocked })}
        className={`h-7 px-2 text-xs ${user.isBlocked ? 'text-green-600' : 'text-orange-500'}`}
        title={user.isBlocked ? 'Unblock' : 'Block'}
      >
        {user.isBlocked ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Ban className="w-3.5 h-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={isRemoving || isSelf}
        onClick={() => {
          if (!confirm(`Delete user "${user.username}"?`)) return
          remove(user.id)
        }}
        className="h-7 px-2 text-xs text-destructive"
        title="Delete user"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
