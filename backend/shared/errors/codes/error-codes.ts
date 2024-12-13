export enum HttpStatusCode {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER = 500,
    SERVICE_UNAVAILABLE = 503
}

export enum ErrorNamespace {
    AUTH = 'AUTH',
    PROCESS = 'PROC',
    TASK = 'TASK',
    DB = 'DB',
    VAL = 'VAL',
    TECH = 'TECH',
    BUSINESS = 'BUS'
}

export const ErrorCode = {
    // Common Errors
    VALIDATION_ERROR: `${ErrorNamespace.VAL}_001`,
    TECHNICAL_ERROR: `${ErrorNamespace.TECH}_001`,
    BUSINESS_ERROR: `${ErrorNamespace.BUSINESS}_001`,
    NOT_FOUND: `${ErrorNamespace.BUSINESS}_002`,
    UNAUTHORIZED: `${ErrorNamespace.AUTH}_001`,
    FORBIDDEN: `${ErrorNamespace.AUTH}_002`,

    // Auth Errors
    AUTH_INVALID_CREDENTIALS: `${ErrorNamespace.AUTH}_003`,
    AUTH_TOKEN_EXPIRED: `${ErrorNamespace.AUTH}_004`,
    AUTH_INSUFFICIENT_PERMISSIONS: `${ErrorNamespace.AUTH}_005`,
    AUTH_INVALID_TOKEN: `${ErrorNamespace.AUTH}_006`,

    // Process Errors
    PROCESS_NOT_FOUND: `${ErrorNamespace.PROCESS}_001`,
    PROCESS_ALREADY_EXISTS: `${ErrorNamespace.PROCESS}_002`,
    PROCESS_INVALID_STATUS: `${ErrorNamespace.PROCESS}_003`,
    PROCESS_CREATION_FAILED: `${ErrorNamespace.PROCESS}_004`,
    PROCESS_UPDATE_FAILED: `${ErrorNamespace.PROCESS}_005`,
    PROCESS_DELETE_FAILED: `${ErrorNamespace.PROCESS}_006`,

    // Task Errors
    TASK_NOT_FOUND: `${ErrorNamespace.TASK}_001`,
    TASK_INVALID_STATE: `${ErrorNamespace.TASK}_002`,
    TASK_VALIDATION_FAILED: `${ErrorNamespace.TASK}_003`,

    // Database Errors
    DB_CONNECTION_ERROR: `${ErrorNamespace.DB}_001`,
    DB_QUERY_ERROR: `${ErrorNamespace.DB}_002`,
    DB_DUPLICATE_KEY: `${ErrorNamespace.DB}_003`,

    // Validation Errors
    INVALID_INPUT: `${ErrorNamespace.VAL}_002`,
    MISSING_FIELD: `${ErrorNamespace.VAL}_003`,
    INVALID_FORMAT: `${ErrorNamespace.VAL}_004`,

    // Technical Errors
    SYSTEM_ERROR: `${ErrorNamespace.TECH}_002`,
    SERVICE_UNAVAILABLE: `${ErrorNamespace.TECH}_003`
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];