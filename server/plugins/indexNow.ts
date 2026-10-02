// Pushes the addresses of the blog to IndexNow (Bing, Yandex and the other engines that take part)
// once after the server starts, as the content only changes with a deploy. The key file is served
// from `public/<key>.txt`; without the key (NUXT_INDEX_NOW_KEY) nothing is sent.
export default defineNitroPlugin(() => {
    const key = useRuntimeConfig().indexNowKey
    if (!key || import.meta.dev) {
        return
    }

    setTimeout(async () => {
        try {
            const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
            const urlList = (await useBlogCatalog())
                .sitemapUrls()
                .map(({ locale, path }) => blogUrl(siteUrl, locale, path))

            const response = await fetch('https://api.indexnow.org/indexnow', {
                body: JSON.stringify({
                    host: new URL(siteUrl).host,
                    key,
                    keyLocation: `${siteUrl}/${key}.txt`,
                    urlList,
                }),
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            })
            console.info(`Submitted ${urlList.length} URLs to IndexNow, response status: ${response.status}`)
        } catch (error) {
            console.warn('Failed to submit URLs to IndexNow.', error)
        }
    }, 10_000)
})
