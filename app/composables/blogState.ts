export const useBlogState = () => {
    const blogState = useState('blogState', () => ({
        documentationItems: [] as SidebarItem[],
        otherItems: [] as SidebarItem[],
    }))

    const setCategories = (sidebarItems: SidebarItem[]) => {
        blogState.value.otherItems = sidebarItems;
    }

    const setDocumentationItems = (sidebarItems: SidebarItem[]) => {
        blogState.value.documentationItems = sidebarItems;
    }

    return {
        blogState: readonly(blogState),
        setCategories,
        setDocumentationItems,
    }
}