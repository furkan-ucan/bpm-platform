import { AppError } from '../base/app-error';
import { ErrorCode, HttpStatusCode } from '../codes/error-codes';

export class BusinessError extends AppError {
    constructor(message: string, details?: any) {
        super(
            HttpStatusCode.BAD_REQUEST,
            'BUSINESS_ERROR',
            message,
            details
        );
    }
} 