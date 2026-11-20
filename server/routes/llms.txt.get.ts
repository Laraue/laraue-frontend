// The site's index for LLMs and AI agents (https://llmstxt.org): the apps and the English blog.
export default defineEventHandler(async (event) => {
    const catalog = await useBlogCatalog()

    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

    return buildLlmsTxt(getSiteUrl(event), catalog.entries('en'), (key) => catalog.seriesTitle('en', key))
})
