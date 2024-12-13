import { AppError } from '../base/app-error';
import { ErrorCode, HttpStatusCode } from '../codes/error-codes';

export class NotFoundError extends AppError {
    constructor(message: string, details?: any) {
        super(
            HttpStatusCode.NOT_FOUND,
            'PROCESS_NOT_FOUND',
            message,
            details
        );
    }
} 