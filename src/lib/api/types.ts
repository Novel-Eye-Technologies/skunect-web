export interface ApiResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  message: string | null;
  data: T;
  errors: ErrorDetail[] | null;
  meta: PageMeta | null;
}

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ErrorDetail {
  code: string;
  field: string;
  message: string;
}

export interface PaginatedParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}
