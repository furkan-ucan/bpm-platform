import { AppError } from '../base/app-error';
import { ErrorCode, HttpStatusCode } from '../codes/error-codes';

export class AuthorizationError extends AppError {
    constructor(message: string, details?: any) {
        super(
            HttpStatusCode.FORBIDDEN,
            'AUTH_INSUFFICIENT_PERMISSIONS',
            message,
            details
        );
    }
} 