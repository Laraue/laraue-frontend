import type { H3Event } from 'h3'

// The same as `useSiteUrl` of the app, for the routes of the server.
export const getSiteUrl = (event: H3Event): string => {
    const base = import.meta.dev ? getRequestURL(event).origin : useRuntimeConfig(event).public.siteUrl

    return base.replace(/\/$/, '')
}
