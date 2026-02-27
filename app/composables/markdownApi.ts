import {useMarkdownClient} from "~/composables/markdownClient";

export interface MarkdownTranspileRequest {
    content: string;
}

export interface MarkdownTranspileResponse {
    htmlContent?: string;
    error?: string;
}

export interface MarkdownHeader {
    propertyName: string;
    value: any;
}

export const useMarkdownApi = () => {
    const client = useMarkdownClient()

    const transpile = async (request: MarkdownTranspileRequest) : Promise<MarkdownTranspileResponse> => {
        return client<MarkdownTranspileResponse>('markdown/transpile', {
            method: 'POST',
            body: request
        });
    }

    return {
        transpile
    }
}