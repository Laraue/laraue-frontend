export const usePdfExtractorClient = () => {
    const configuration = useRuntimeConfig();
    return $fetch.create({
        baseURL: configuration.public.pdfExtractorBaseAddress,
    })
}