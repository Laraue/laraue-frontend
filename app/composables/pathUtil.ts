export const usePathUtil = () => {
    const localePath = useLocalePath()

    const localePathFromSegments = (sections?: string[]) => {
        return localePath('/' + sections?.join('/'));
    }

    const getRouteSegments = (routePath: string) => {
        return routePath.split('/').filter(segment => segment !== '')
    }

    return {
        localePathFromSegments,
        getRouteSegments,
    }
}