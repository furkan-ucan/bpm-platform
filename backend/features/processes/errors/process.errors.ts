import { AppError } from '@/shared/errors/base/app-error';
import { ErrorCode } from '@/shared/errors/codes/error-codes';
import { PROCESS_ERROR_MESSAGES } from './messages';

export class ProcessNotFoundError extends AppError {
    constructor(processId?: string) {
        const message = processId
            ? `${processId} ID'li ${PROCESS_ERROR_MESSAGES.NOT_FOUND}`
            : PROCESS_ERROR_MESSAGES.NOT_FOUND;

        super(message, ErrorCode.NOT_FOUND, ErrorCode.PROCESS_NOT_FOUND);
    }
}

export class ProcessAlreadyExistsError extends AppError {
    constructor(processName: string) {
        super(
            `"${processName}" ${PROCESS_ERROR_MESSAGES.NAME_EXISTS}`,
            ErrorCode.CONFLICT,
            ErrorCode.PROCESS_ALREADY_EXISTS
        );
    }
}

export class ProcessValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(
            message,
            ErrorCode.BAD_REQUEST,
            ErrorCode.PROCESS_INVALID_STATUS,
            details
        );
    }
}

export class ProcessOperationError extends AppError {
    constructor(
        message: string,
        code: ErrorCode = ErrorCode.PROCESS_CREATION_FAILED
    ) {
        super(message, ErrorCode.BAD_REQUEST, code);
    }
} 