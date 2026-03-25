import { apiClient } from './client'

export type SupportTicketPriority = 'High' | 'Average' | 'Low'

export interface CreateSupportTicketPayload {
  summary: string
  priority: SupportTicketPriority
  inventoryTitle?: string
  pageLink: string
}

export const supportApi = {
  createTicket: (data: CreateSupportTicketPayload) =>
    apiClient.post<{ success: boolean; filename: string }>('/support/ticket', data).then((r) => r.data),
}
