import { AppError } from '../base/app-error';
import { ErrorCode } from '../codes/error-codes';

export class AuthorizationError extends AppError {
    constructor(message: string, details?: any) {
        super(
            message,
            ErrorCode.FORBIDDEN,
            ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
            details
        );
    }
} 