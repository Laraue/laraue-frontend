// The blog is read from the server of this app (`server/routes/blog-content`): it renders the pages
// from the markdown files, the browser only asks for it when the visitor moves between pages.
export const useBlogApi = () => {
    const client = useRequestFetch()

    const getCategories = async (languageCode: string): Promise<SidebarItem[]> => {
        return client<SidebarItem[]>('/blog-content/categories', {
            query: { languageCode },
        });
    }

    const getArticles = async (
        languageCode: string,
        tag: string | undefined,
        page: number,
        perPage: number)
        : Promise<PaginationData<ItemListItem>> => {
        return client<PaginationData<ItemListItem>>('/blog-content/list', {
            query: { languageCode, section: 'articles', tag, page, perPage },
        });
    }

    const getArticle = async (languageCode: string, fileName: string): Promise<ItemDetails> => {
        return client<ItemDetails>(`/blog-content/articles/${encodeURIComponent(fileName)}`, {
            query: { languageCode },
        });
    }

    const getProjects = async (
        languageCode: string,
        page: number,
        perPage: number)
        : Promise<PaginationData<ItemListItem>> => {
        return client<PaginationData<ItemListItem>>('/blog-content/list', {
            query: { languageCode, section: 'projects', page, perPage },
        });
    }

    const getProject = async (languageCode: string, fileName: string): Promise<ItemDetails> => {
        return client<ItemDetails>(`/blog-content/projects/${encodeURIComponent(fileName)}`, {
            query: { languageCode },
        });
    }

    const getFeed = async (
        languageCode: string,
        tag: string | undefined,
        page: number,
        perPage: number)
        : Promise<PaginationData<ItemListItem>> => {
        return client<PaginationData<ItemListItem>>('/blog-content/list', {
            query: { languageCode, tag, page, perPage },
        });
    }

    const getTags = async (languageCode: string): Promise<Tag[]> => {
        return client<Tag[]>('/blog-content/tags', {
            query: { languageCode },
        });
    }

    return {
        getCategories,
        getArticles,
        getArticle,
        getProjects,
        getProject,
        getFeed,
        getTags,
    }
}
