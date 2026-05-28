import {ApiError} from "~/composables/apiError";

export const useMarkdownClient = () => {
    const configuration = useRuntimeConfig();
    return $fetch.create({
        baseURL: configuration.public.markdownBaseAddress,
        onResponseError: async (context) => {
            throw new ApiError(context.response.status, context.response._data.errors ?? {})
        }
    })
}