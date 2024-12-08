import { AppError } from './app-error';
import { ErrorCode } from './error-codes';

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, ErrorCode.VALIDATION_ERROR);
        this.name = 'ValidationError';
    }
} 