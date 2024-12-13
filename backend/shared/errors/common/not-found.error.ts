import { AppError } from '../base/app-error';
import { ErrorCode } from '../codes/error-codes';

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, ErrorCode.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
} 