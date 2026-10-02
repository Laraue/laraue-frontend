// The public address of the site, without a trailing slash. Absolute addresses (preview images,
// the feed) point to the site that serves the page: in development to the local server.
export const useSiteUrl = (): string => {
    const base = import.meta.dev ? useRequestURL().origin : useRuntimeConfig().public.siteUrl

    return base.replace(/\/$/, '')
}
