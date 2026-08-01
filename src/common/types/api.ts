export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorPayload = {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorPayload;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PaginatedData<T> = {
  items: T[];
  pagination: PaginationMeta;
};
