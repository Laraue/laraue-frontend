export const useApartmentsClient = () => {
    const configuration = useRuntimeConfig();
    return $fetch.create({
        baseURL: configuration.public.apartmentsBaseAddress,
    })
}