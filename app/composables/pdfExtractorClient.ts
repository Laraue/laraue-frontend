export const usePdfExtractorClient = () => {
    return $fetch.create({
        baseURL: import.meta.env.VITE_PDFQL_BASE_URL,
    })
}