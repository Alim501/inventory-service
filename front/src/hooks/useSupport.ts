import { useMutation } from '@tanstack/react-query'
import type { CreateSupportTicketPayload } from '@/api/support'
import { supportApi } from '@/api/support'

export function useCreateSupportTicket() {
  return useMutation({
    mutationFn: (data: CreateSupportTicketPayload) => supportApi.createTicket(data),
  })
}
