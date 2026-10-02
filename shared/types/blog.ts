export type BlogLocale = 'en' | 'ru'

export type BlogContentType = 'article' | 'project'

export interface InnerLink {
    level: number;
    link: string;
    title: string;
}

export interface SidebarItem {
    key: string;
    title: string;
    count: number;
    icon: string;
    path: string[];
}

export interface NeighborCard {
    title: string;
    path: string[];
}

export interface ItemListItem {
    fileName: string;
    title: string;
    description: string;
    contentType: BlogContentType;
    path: string[];
    length: number;
    tags: string[] | null;
    projects: string[] | null;
}

export interface ItemDetails {
    title: string;
    description: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    createdAtIso: string;
    updatedAtIso: string;
    contentType: BlogContentType;
    innerLinks: InnerLink[];
    previousLink?: NeighborCard;
    nextLink?: NeighborCard;
    tags: string[] | null;
    projects: string[] | null;
    length: number;
}

export interface Tag {
    key: string;
}

export interface PaginationData<T> {
    page: number;
    perPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    data: T[];
}
