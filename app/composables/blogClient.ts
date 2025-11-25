export const useBlogClient = () => {
    return $fetch.create({
        baseURL: import.meta.env.VITE_CMS_BACKEND_BASE_URL,
    })
}