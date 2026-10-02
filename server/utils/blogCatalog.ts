import { blogSections, createBlogCatalog, type BlogCatalog } from '../../shared/blog/catalog'

let catalog: Promise<BlogCatalog> | undefined

const readCatalog = async (): Promise<BlogCatalog> => {
    const storage = useStorage('assets:blog')
    const files: Record<string, string> = {}
    for (const key of await storage.getKeys()) {
        const raw = await storage.getItemRaw(key)
        // Storage keys look like `en:articles:ollama-dotnet.md`.
        files[key.replaceAll(':', '/')] =
            raw instanceof Uint8Array ? new TextDecoder().decode(raw) : String(raw)
    }

    return createBlogCatalog(files)
}

// The blog (`content/blog`, bundled with the server as `blog` assets) is read once and kept. While
// developing it is read on every request, to see the edits of the files.
export const useBlogCatalog = (): Promise<BlogCatalog> => {
    if (import.meta.dev) {
        return readCatalog()
    }

    return (catalog ??= readCatalog())
}

export const getBlogLocale = (value: unknown): BlogLocale => {
    if (value === 'en' || value === 'ru') {
        return value
    }

    throw createError({ statusCode: 400, statusMessage: 'languageCode must be en or ru' })
}

export const getBlogSection = (value: unknown): (typeof blogSections)[number] => {
    const section = blogSections.find((candidate) => candidate.folder === value)
    if (!section) {
        throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }

    return section
}
