
export const usePathUtil = () => {
    const localePathInner = useLocalePath()
    const { locale } = useI18n()

    const localePathFromSegments = (sections?: string[]) => {
        return localePathInner('/' + sections?.join('/'));
    }

    const localePath = (path: string) => {
        return localePathInner(path);
    }

    const getRouteSegmentsByPath = (routePath: string) => {
        return routePath.split('/').filter(segment => segment !== '')
    }

    const getRouteSegments = (() => {
        const route = useRoute();

        const segments = getRouteSegmentsByPath(route.path);
        if (segments[0] === locale.value)
            segments.splice(0 ,1)

        return segments
    })

    const getBlogOgImageUrl = () => {
        const config = useRuntimeConfig()
        const ogImageUrl = new URL(config.public.blogBaseAddress + "/images/og-image");
        const routeSegments = getRouteSegments()
        routeSegments.forEach(id => ogImageUrl.searchParams.append('articlePath', id));
        ogImageUrl.searchParams.set("languageCode", locale.value);

        return ogImageUrl.toString();
    }

    return {
        localePathFromSegments,
        localePath,
        getRouteSegments,
        getBlogOgImageUrl,
    }
}