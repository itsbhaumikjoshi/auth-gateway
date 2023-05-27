export type ErrorCodes = "invalid_arguments" | "not_found" | "internal_error" | "forbidden" | "unauthenticated";

export type ServerError = {
    error_code: string,
    description?: string,
};
