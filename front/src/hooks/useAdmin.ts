import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UpdateProfilePayload, UpdateUserAdminPayload } from '@/api/users'
import { usersApi } from '@/api/users'
import { useAuthStore } from '@/store/auth.store'

const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
  me: ['users', 'me'] as const,
}

export function useAllUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: usersApi.getAll,
  })
}

export function useUpdateUserAdmin(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUserAdminPayload) =>
      usersApi.updateAdmin(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  const { setUser } = useAuthStore()
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => usersApi.updateMe(data),
    onSuccess: (updated) => {
      setUser(updated)
      qc.invalidateQueries({ queryKey: userKeys.me })
    },
  })
}
