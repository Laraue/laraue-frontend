import {ApiError} from "~/composables/apiError";

export const useBillingClient = () => {
    const configuration = useRuntimeConfig();
    return $fetch.create({
        baseURL: configuration.public.billingBaseAddress,
        onResponseError: async (context) => {
            throw new ApiError(context.response.status, context.response._data.errors ?? {})
        }
    })
}
