import {usePdfExtractorClient} from "~/composables/pdfExtractorClient";

export interface PsqlExecutionResult {
    result: any;
    errors: PdfqlError[];
}

export interface CheckQueryResult {
    errors: PdfqlError[];
}

export interface PdfqlError {
    message: string;
    startPosition: number;
    endPosition: number;
    startLineNumber: number;
    endLineNumber: number;
}


export const usePdfExtractorApi = () => {
    const client = usePdfExtractorClient()

    const checkSyntax = async (query: string) : Promise<CheckQueryResult> => {
        return client<CheckQueryResult>('psql/check-query', {
            method: 'POST',
            body: {
                pdfql: query
            }
        });
    }

    const runQuery = async (query: string, pdfBytes: string) : Promise<PsqlExecutionResult> => {
        return client<PsqlExecutionResult>('psql/run-query', {
            method: 'POST',
            body: {
                pdfql: query,
                pdfBytes: pdfBytes,
                extractionAlgorithm: 0
            }
        });
    }

    return {
        checkSyntax,
        runQuery,
    }
}