import { ErrorCode, HttpStatusCode } from '../codes/error-codes';

export interface ErrorDetails {
    [key: string]: any;
}

export abstract class AppError extends Error {
    constructor(
        public readonly statusCode: HttpStatusCode,
        public readonly code: keyof typeof ErrorCode,
        message: string,
        public readonly details?: ErrorDetails
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details
        };
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: ErrorDetails) {
        super(
            HttpStatusCode.BAD_REQUEST,
            'VALIDATION_ERROR',
            message,
            details
        );
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, details?: ErrorDetails) {
        super(
            HttpStatusCode.NOT_FOUND,
            'PROCESS_NOT_FOUND',
            message,
            details
        );
    }
}

export class TechnicalError extends AppError {
    constructor(message: string, details?: ErrorDetails) {
        super(
            HttpStatusCode.INTERNAL_SERVER,
            'TECHNICAL_ERROR',
            message,
            details
        );
    }
}