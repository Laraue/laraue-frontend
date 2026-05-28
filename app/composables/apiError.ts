export class ApiError extends Error {
    constructor(public status: number, public errors: { [key: string]: string[] }) {

        const error = Object.values(errors)
            .flat()
            .join('\n');

        super(`API response ${status}. ${error}`);
    }
}