export interface PaginatedResponse<T> {
  page: number;
  totalPages: number;
  hasNext: boolean;
  contents: T[];
}

export interface ErrorResponse {
  error: string;
  message: string | string[];
}
