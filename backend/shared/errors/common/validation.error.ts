import { AppError } from '../base/app-error';
import { ErrorCode } from '../codes/error-codes';

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(
            message,
            ErrorCode.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
            details
        );
    }
} 