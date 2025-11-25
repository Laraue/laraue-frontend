export const useBlogClient = () => {
    const configuration = useRuntimeConfig();
    return $fetch.create({
        baseURL: configuration.public.blogBaseAddress,
    })
}