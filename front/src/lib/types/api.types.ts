export interface PaginatedResponse<T> {
  data: Array<T>
  total: number
  page: number
  limit: number
}

export interface ApiError {
  statusCode: number
  message: string | Array<string>
  error: string
}
