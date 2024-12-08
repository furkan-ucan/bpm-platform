import { ErrorCode } from './error-codes';

export abstract class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, errorCode: ErrorCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, ErrorCode.VALIDATION_ERROR);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, ErrorCode.NOT_FOUND);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string) {
        super(message, ErrorCode.AUTHENTICATION_ERROR);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string) {
        super(message, ErrorCode.AUTHORIZATION_ERROR);
    }
}