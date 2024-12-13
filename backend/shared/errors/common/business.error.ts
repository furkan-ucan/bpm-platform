import { AppError } from '../base/app-error';
import { ErrorCode } from '../codes/error-codes';

export class BusinessError extends AppError {
    constructor(message: string, details?: any) {
        super(
            message,
            ErrorCode.BAD_REQUEST,
            ErrorCode.BUSINESS_ERROR,
            details
        );
    }
} 