export const useApartmentsClient = () => {
    return $fetch.create({
        baseURL: import.meta.env.VITE_APARTMENTS_BASE_URL,
    })
}