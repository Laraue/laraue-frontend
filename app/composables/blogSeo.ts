import type {Ref} from "vue";

// The structured data and the indexing rules shared by the pages of the blog.
export const useBlogSeo = () => {
    const route = useRoute()
    const { publisher } = useConstants()

    // The address of the current page without the query, as the search engines see it.
    const pageUrl = () => `${useSiteUrl()}${route.path}`.replace(/\/$/, '')

    // The dates of the pages are wall clock times, the sitemap sends them as UTC: the same here.
    const { localePathFromSegments } = usePathUtil()

    // The pages of a list, numbered through all its pages.
    const itemList = (items: { path: string[]; title: string }[], page: number, perPage: number) => ({
        '@type': 'ItemList',
        itemListOrder: 'https://schema.org/ItemListUnordered',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: (page - 1) * perPage + index + 1,
            name: item.title,
            url: `${useSiteUrl()}${localePathFromSegments(item.path)}`,
        })),
    })

    const toUtc = (iso: string) => `${iso}Z`

    return {
        publisher,
        pageUrl,
        itemList,
        toUtc,
        // The page is the main thing of its address.
        mainEntityOfPage: () => ({ '@type': 'WebPage', '@id': pageUrl() }),
    }
}

// A list of the blog: the page of a list and the tag filter. A filtered list repeats the pages of
// the full list, so it is out of the index (its links are still followed). Every page of a list
// has its own address, so it is the canonical one.
export const useListIndexing = (page: Ref<number>, tag?: Ref<string | undefined>) => {
    const route = useRoute()
    const siteUrl = useSiteUrl()

    useHead({
        link: [{
            key: 'canonical',
            rel: 'canonical',
            href: computed(() => `${siteUrl}${route.path}`.replace(/\/$/, '') + (page.value > 1 && !tag?.value ? `?page=${page.value}` : '')),
        }],
    })

    useSeoMeta({
        robots: computed(() => tag?.value ? 'noindex, follow' : 'index, follow, max-image-preview:large'),
    })
}
