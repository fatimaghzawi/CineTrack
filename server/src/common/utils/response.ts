import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginatedData,
  PaginationMeta,
} from '@common/types/api';

export function success<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T> {
  if (meta === undefined) {
    return { success: true, data };
  }

  return { success: true, data, meta };
}

export function failure(
  message: string,
  code: string,
  statusCode: number,
  details?: unknown,
): ApiErrorResponse {
  const error: ApiErrorResponse['error'] = {
    message,
    code,
    statusCode,
  };

  if (details !== undefined) {
    error.details = details;
  }

  return {
    success: false,
    error,
  };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1 && totalPages > 0,
  };
}

export function paginated<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedData<T> {
  return {
    items,
    pagination: buildPaginationMeta(page, limit, total),
  };
}
