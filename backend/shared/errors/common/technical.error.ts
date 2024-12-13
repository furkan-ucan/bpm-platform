import { AppError } from '../base/app-error';
import { ErrorCode, HttpStatusCode } from '../codes/error-codes';

export class TechnicalError extends AppError {
    constructor(message: string, details?: any) {
        super(
            HttpStatusCode.INTERNAL_SERVER,
            'TECHNICAL_ERROR',
            message,
            details
        );
    }
}