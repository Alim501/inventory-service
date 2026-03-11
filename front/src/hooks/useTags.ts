import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '@/api/tags'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
    staleTime: 5 * 60 * 1000, // tags rarely change — cache 5 min
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => tagsApi.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })
}
