import {useMarkdownClient} from "~/composables/markdownClient";

export interface MarkdownTranspileRequest {
    content: string;
}

export interface MarkdownTranspileResponse {
    htmlContent?: string;
    error?: string;
}

export interface MarkdownTranslateRequest {
    content: string;
    from: string;
    to: string;
}

export interface MarkdownTranslateResponse {
    content: string;
}

export const useMarkdownApi = () => {
    const client = useMarkdownClient()

    const transpile = async (request: MarkdownTranspileRequest) => {
        return client<MarkdownTranspileResponse>('markdown-transpiler/transpile', {
            method: 'POST',
            body: request
        });
    }

    const translate = async (request: MarkdownTranslateRequest) => {
        return client<MarkdownTranslateResponse>('markdown-translator/translate', {
            method: 'POST',
            body: request
        });
    }

    return {
        transpile,
        translate,
    }
}