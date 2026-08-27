import {useBlogClient} from "~/composables/blogClient";


export interface CountPropertyRow {
    key: string;
    count: number;
}

export interface ArticleListRow {
    fileName: string;
    title: string;
    description: string;
    contentType: string;
    projects: string[] | undefined;
    length: number;
    path: string[];
}

export interface ProjectListRow {
    fileName: string;
    title: string;
    description: string;
    contentType: string;
    tags: string[] | undefined;
    length: number;
    path: string[];
}

export interface DocumentationItem {
    fileName: string;
    title: string;
    description: string;
    contentType: string;
    length: number;
    path: string[];
}

export interface SelectItem{
    fileName: string;
    title: string | undefined;
}

export interface InnerLink{
    level: number;
    link: string;
    title: string;
}

export interface MenuItem{
    fileName: string;
    fullPath: string[];
    relativePath: string[];
    title: string | undefined;
    children: MenuItem[];
    hasContent: boolean;
}

export interface SidebarItem {
    key: string;
    title: string;
    count: number;
    icon: string;
    path: string[];
}

export interface ItemDetails {
    title: string | undefined;
    description: string | undefined;
    content: string | undefined;
    createdAt: string;
    contentType: string;
    updatedAt: string | undefined;
    createdAtIso: string;
    updatedAtIso: string;
    innerLinks: InnerLink[];
    previousLink?: NeighborCard;
    nextLink?: NeighborCard;
    tags?: string[];
    projects?: string[];
    keywords?: string[];
    length: number;
}

export interface ItemMeta {
    title: string | undefined;
    description: string | undefined;
    icon: string | undefined;
}

export interface NeighborCard {
    title: string | undefined;
    path: string[];
}

export interface ItemListItem {
    fileName: string;
    title: string;
    description: string;
    contentType: string;
    path: string[];
    length: number;
    tags: string[];
    projects: string[];
}

export interface HierarchicalMenuSection {
    title: string | undefined;
    path: string[];
    children: HierarchicalMenuItem[]
}

export interface HierarchicalMenuItem {
    title: string | undefined;
    path: string[];
}

export interface Tag {
    key: string;
}

export const useBlogApi = () => {
    const client = useBlogClient()

    const loadMenu = (languageCode: string, fromPath: string[]) => {
        return client<HierarchicalMenuSection[]>('blog/docs-hierarchy', {
            method: 'GET',
            query: {
                "languageCode": languageCode,
                "fromPath": fromPath,
            }
        });
    }

    const getCategories = async (
        languageCode: string)
        : Promise<SidebarItem[]> => {
        return client<SidebarItem[]>('blog/categories', {
            method: 'GET',
            query: {
                languageCode: languageCode,
            }
        });
    }

    const getDocs = async (
        languageCode: string)
        : Promise<SidebarItem[]> => {
        return client<SidebarItem[]>('blog/docs', {
            method: 'GET',
            query: {
                languageCode: languageCode,
            }
        });
    }

    const getItemDetails = async (
        languageCode: string,
        path: string[])
        : Promise<ItemDetails> => {
        return client<ItemDetails>('blog/details', {
            method: 'POST',
            body: {
                languageCode: languageCode,
                path: path,
            }
        });
    }

    const getItemMeta = async (
        languageCode: string,
        path: string[])
        : Promise<ItemMeta> => {
        return client<ItemMeta>('blog/meta', {
            method: 'POST',
            body: {
                languageCode: languageCode,
                path: path,
            }
        });
    }

    const getItems = async (
        languageCode: string,
        path: string[],
        contentTypes: string[],
        tag: string | undefined,
        page: number,
        perPage: number)
        : Promise<PaginationData<ItemListItem>> => {
        return client<PaginationData<ItemListItem>>('blog/list', {
            method: 'POST',
            body: {
                languageCode: languageCode,
                path: path,
                pagination: {
                    page: page,
                    perPage: perPage
                },
                contentTypes: contentTypes,
                tag: tag,
            }
        });
    }

    const getTags = async (
        languageCode: string)
        : Promise<Tag[]> => {
        return client<Tag[]>('blog/tags', {
            method: 'GET',
            query: {
                languageCode: languageCode
            }
        });
    }

    return {
        loadMenu,
        getCategories,
        getDocs,
        getItemDetails,
        getItems,
        getTags,
        getItemMeta,
    }
}