export const useBlogState = () => {
    const blogState = useState('blogState', () => ({
        otherItems: [] as SidebarItem[],
    }))

    const setCategories = (sidebarItems: SidebarItem[]) => {
        blogState.value.otherItems = sidebarItems;
    }

    return {
        blogState: readonly(blogState),
        setCategories,
    }
}