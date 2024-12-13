import { AppError } from '../base/app-error';
import { ErrorCode } from '../codes/error-codes';

export class TechnicalError extends AppError {
    constructor(message: string) {
        super(
            message,
            ErrorCode.INTERNAL_SERVER,
            ErrorCode.TECHNICAL_ERROR
        );
    }
} 