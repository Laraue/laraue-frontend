export const usePathUtil = () => {
    const localePathInner = useLocalePath()

    const localePathFromSegments = (sections?: string[]) => {
        return localePathInner('/' + sections?.join('/'));
    }

    const localePath = (path: string) => {
        return localePathInner(path);
    }

    const getRouteSegments = (routePath: string) => {
        return routePath.split('/').filter(segment => segment !== '')
    }

    return {
        localePathFromSegments,
        localePath,
        getRouteSegments,
    }
}