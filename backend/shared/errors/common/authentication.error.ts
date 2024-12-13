import { AppError } from '../base/app-error';
import { ErrorCode, HttpStatusCode } from '../codes/error-codes';

export class AuthenticationError extends AppError {
    constructor(message: string, details?: any) {
        super(
            HttpStatusCode.UNAUTHORIZED,
            'AUTH_INVALID_CREDENTIALS',
            message,
            details
        );
    }
} 