export interface PaginationData<T> {
    page: number;
    perPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    data: T[];
}