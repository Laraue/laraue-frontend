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
    // The title and the description for search results and social cards: short, as they are cut there.
    seoTitle: string;
    seoDescription: string;
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
    // The pages of the projects the page is related to (`projects` are their names).
    relatedProjects: NeighborCard[];
    length: number;
}

// A list of the blog (all the pages, articles, projects): the texts of its page.
export interface BlogSection {
    title: string;
    seoTitle: string;
    seoDescription: string;
    subTitle: string;
}

export interface Tag {
    key: string;
    // The number of pages with the tag.
    count: number;
}

export interface PaginationData<T> {
    page: number;
    perPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    data: T[];
}
