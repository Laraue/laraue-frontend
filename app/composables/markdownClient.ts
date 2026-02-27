export const useMarkdownClient = () => {
    const configuration = useRuntimeConfig();
    return $fetch.create({
        baseURL: configuration.public.markdownBaseAddress,
    })
}