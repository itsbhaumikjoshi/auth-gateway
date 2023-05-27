import { ErrorCodes, ServerError } from "./types/errorHandler";

export const getErrorCodeStatus = (code: string) => {
    switch (code) {
        case "invalid_arguments":
            return 400;
        case "not_found":
            return 404;
        case "forbidden":
            return 403;
        case "unauthenticated":
            return 401;
        default:
            return 500
    }
}

const defaultError = (code: ErrorCodes): ServerError => {
    switch (code) {
        case "invalid_arguments":
            return {
                error_code: code,
                description: "The provided arguments are not valid."
            }
        case "not_found":
            return {
                error_code: code,
                description: "Entity not found."
            }
        case "forbidden":
            return {
                error_code: code,
                description: "You are not authorized to access this route."
            }
        case "unauthenticated":
            return {
                error_code: code,
                description: "Please login to access this route."
            }
        case "internal_error":
            return {
                error_code: code,
                description: "Something went wrong."
            }
    }
}

export class ServerErrors {
    error: ServerError;

    constructor(code: ErrorCodes, description?: string) {
        this.error = defaultError(code);
        this.error = {
            ...this.error,
            description,
        }

    }

    toJson() {
        return this.error;
    }
}