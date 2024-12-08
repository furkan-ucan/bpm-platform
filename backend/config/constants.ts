export const APP_CONSTANTS = {
    // Auth related
    PASSWORD_SALT_ROUNDS: 10,
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_ATTEMPTS_WINDOW: 15 * 60 * 1000, // 15 minutes

    // Process related
    MAX_PROCESS_NAME_LENGTH: 100,
    MAX_PROCESS_DESCRIPTION_LENGTH: 500,

    // File upload
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],

    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,

    // Cache
    DEFAULT_CACHE_TTL: 60 * 60, // 1 hour

    // Rate limiting
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100
}; 