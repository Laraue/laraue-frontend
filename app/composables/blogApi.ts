import {useBlogClient} from "~/composables/blogClient";
import type {PaginationData} from "~/composables/pagination";


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

export interface ProjectArticleRow {
    fileName: string;
    title: string;
    description: string;
    length: number;
}

export interface ArticleDetails {
    title: string;
    content: string;
    projects: string[] | undefined;
    tags: string[] | undefined;
    createdAt: string;
    updatedAt: string;
    innerLinks: InnerLink[] | undefined;
    length: number;
    description: string;
}

export interface ProjectDetails {
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    tags: string[] | undefined;
    length: number;
    innerLinks: InnerLink[] | undefined;
    description: string;
}

export interface DocumentationDetails {
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    length: number;
}

export interface SidebarItemRow {
    fileName: string;
    title: string;
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
    updatedAt: string | undefined;
    innerLinks: InnerLink[];
}

export const useBlogApi = () => {
    const client = useBlogClient()

    const loadProject = async (
        languageCode: string,
        id: string)
        : Promise<ProjectDetails> => {
        return client<ProjectDetails>('blog/single', {
            method: 'POST',
            body: {
                languageCode: languageCode,
                path: path.getPath(["projects"].concat(id)),
                properties: [
                    "title",
                    "content",
                    formattedDate("createdAt"),
                    formattedDate("updatedAt"),
                    "tags",
                    "length(content)",
                    "innerLinks",
                    "description"],
            }
        });
    }

    const loadArticlesList = async (
        languageCode: string,
        page: number,
        perPage: number,
        selectedProject: string | undefined,
        selectedTag: string | undefined) : Promise<ArticleListRow[]> => {

        const filters = [{
            property: "contentType",
            value: "article",
            operator: 0
        }];

        if (selectedProject)
            filters.push({
                property: "projects",
                value: selectedProject,
                operator: 5
            })

        if (selectedTag)
            filters.push({
                property: "tags",
                value: selectedTag,
                operator: 5
            })

        const result = await client<PaginationData<ArticleListRow>>('blog/list', {
            method: 'POST',
            body: {
                languageCode: languageCode,
                properties: ["fileName", "description", "projects", "title", "length(content)", "path", "contentType"],
                pagination: {
                    page: page,
                    perPage: perPage,
                },
                filters: filters
            }
        });

        return result.data;
    }

    const loadProjects = async (
        languageCode: string,
        page: number,
        perPage: number,
        selectedTag: string | null) : Promise<ProjectListRow[]> => {

        const filters = [{
            property: "contentType",
            value: "project",
            operator: 0
        }];

        if (selectedTag)
            filters.push({
                property: "tags",
                value: selectedTag,
                operator: 5
            })

        const result = await client<PaginationData<ProjectListRow>>('blog/list', {
            method: 'POST',
            body: {
                languageCode: languageCode,
                properties: ["fileName", "description", "title", "tags", "length(content)", "path", "contentType"],
                pagination: {
                    page: page,
                    perPage: perPage,
                },
                filters: filters
            }
        });

        return result.data;
    }

    const countPropertyValues = async (languageCode: string, propertyName: string, fromPath: string[] = []) => {
        return await client<CountPropertyRow[]>('blog/property-values-count', {
            method: 'POST',
            body: {
                languageCode: languageCode,
                property: propertyName,
                fromPath: fromPath
            }
        });
    }

    const loadMenu = (languageCode: string, fromPath: string[], depth: number) => {
        return client<MenuItem[]>('blog/sections', {
            method: 'POST',
            body: {
                "languageCode": languageCode,
                "fromPath": fromPath,
                "depth": depth,
            }
        });
    }

    const loadDocumentationItemsList = (
        languageCode: string,
        page: number,
        perPage: number,
        selectedProject: string | null,
        selectedTag: string | null,
        selectedContentType: string | null)=> {
        const filters = [{
            property: "length(content)",
            value: 0 as any,
            operator: 1
        }];

        if (selectedProject)
            filters.push({
                property: "projects",
                value: selectedProject,
                operator: 5
            })

        if (selectedTag)
            filters.push({
                property: "tags",
                value: selectedTag,
                operator: 5
            })

        if (selectedContentType)
            filters.push({
                property: "contentType",
                value: selectedContentType,
                operator: 0
            })

        return client<PaginationData<DocumentationItem>>('blog/list', {
            method: 'POST',
            body: {
                languageCode: languageCode,
                properties: ["fileName", "description", "contentType", "title", "length(content)", "path"],
                pagination: {
                    page: page,
                    perPage: perPage,
                },
                filters: filters
            }
        });
    }

    const loadSelectOptions = async (languageCode: string, contentType: string, page: number, perPage: number) : Promise<SelectItem[]> => {
        const result = await client<PaginationData<SelectItem>>('blog/list', {
            method: 'POST',
            body: {
                languageCode: languageCode,
                properties: ["fileName", "title"],
                pagination: {
                    page: page,
                    perPage: perPage,
                },
                filters: [{
                    property: "contentType",
                    value: contentType,
                    operator: 0
                }]
            }
        });

        return result.data;
    }

    const loadSidebarItems = async (languageCode: string, contentType: string, count: number) : Promise<SidebarItemRow[]> => {
        const result = await client<PaginationData<SidebarItemRow>>('blog/list', {
            method: 'POST',
            body: {
                languageCode: languageCode,
                properties: ["fileName", "title"],
                pagination: {
                    page: 0,
                    perPage: count,
                },
                filters: [{
                    property: "contentType",
                    value: contentType,
                    operator: 0
                }]
            }
        });

        return result.data;
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

    const formattedDate = (propertyName: string) => 'format(' + propertyName + ', "dd MMM yyyy") as ' + propertyName;

    return {
        loadProject,
        loadArticlesList,
        loadProjects,
        countPropertyValues,
        loadMenu,
        loadDocumentationItemsList,
        loadSelectOptions,
        loadSidebarItems,
        getCategories,
        getDocs,
        getItemDetails,
    }
}