import { ErrorCode } from './error-codes';

export abstract class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number = 500,
        public readonly code?: string,
        public readonly details?: any
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, 'NOT_FOUND');
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string) {
        super(message, 403, 'FORBIDDEN');
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string) {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class BusinessError extends AppError {
    constructor(message: string, code?: string) {
        super(message, 400, code || 'BUSINESS_ERROR');
    }
}

export class TechnicalError extends AppError {
    constructor(message: string) {
        super(message, 500, 'TECHNICAL_ERROR');
    }
}