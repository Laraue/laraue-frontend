export class ApiError extends Error {
    constructor(
        public status: number,
        public errors: { [key: string]: string[] },
        // Seconds to wait before the next try, from the Retry-After header of a 429 response.
        public retryAfter: number | null = null) {

        const error = Object.values(errors)
            .flat()
            .join('\n');

        super(`API response ${status}. ${error}`);
    }

    get isTooManyRequests() {
        return this.status === 429;
    }
}

// Retry-After of the Markdown API is in seconds; the HTTP-date form isn't used by it.
export const parseRetryAfter = (header: string | null): number | null => {
    if (!header || !/^\d+$/.test(header.trim()))
        return null;

    return Number.parseInt(header, 10);
}
