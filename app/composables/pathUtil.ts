
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
        // The address is served by this app and is the one social networks already cache.
        const ogImageUrl = new URL(`${useSiteUrl()}/api/blog/images/og-image`);
        const routeSegments = getRouteSegments()
        routeSegments.forEach(id => ogImageUrl.searchParams.append('articlePath', id));
        ogImageUrl.searchParams.set("languageCode", locale.value);

        return ogImageUrl.toString();
    }

    const localeSuffix = () => locale.value === 'ru' ? '-ru' : '';

    const getStaticOgImageUrl = (name: string) => {
        const config = useRuntimeConfig()
        return computed(() => `${config.public.imagesBaseAddress}${name}${localeSuffix()}.png`);
    }

    return {
        localePathFromSegments,
        localePath,
        getRouteSegments,
        getBlogOgImageUrl,
        getStaticOgImageUrl,
    }
}