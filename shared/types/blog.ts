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

// A page of the same series: a numbered part, the one the visitor reads is marked.
export interface SeriesPart {
    part: number;
    title: string;
    path: string[];
    current: boolean;
}

export interface Series {
    title: string;
    parts: SeriesPart[];
}

// A link to another page of the blog.
export interface RelatedPage {
    title: string;
    path: string[];
    contentType: BlogContentType;
}

export interface ItemDetails {
    title: string;
    description: string;
    // The title and the description for search results and social cards: short, as they are cut there.
    seoTitle: string;
    seoDescription: string;
    content: string;
    // `2026-06-26T15:00:00`, the wall clock time: the page shows it in the language of the visitor.
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
    series?: Series;
    // Pages with the same tags, to read next.
    relatedPages: RelatedPage[];
    // For a project: the articles that tell about it.
    projectArticles: RelatedPage[];
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
