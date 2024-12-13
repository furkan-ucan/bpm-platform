import { AppError } from '../base/app-error';
import { ErrorCode } from '../codes/error-codes';

export class AuthenticationError extends AppError {
    constructor(message: string, details?: any) {
        super(
            message,
            ErrorCode.UNAUTHORIZED,
            ErrorCode.AUTHENTICATION_FAILED,
            details
        );
    }
} 