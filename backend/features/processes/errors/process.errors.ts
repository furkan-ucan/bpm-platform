import { AppError } from '@/shared/errors/base/app-error';
import { ErrorCode, HttpStatusCode } from '@/shared/errors/codes/error-codes';
import { ERROR_MESSAGES } from '@/shared/constants/error-messages';

export class ProcessNotFoundError extends AppError {
    constructor(processId?: string) {
        const message = processId
            ? `${processId} ID'li ${ERROR_MESSAGES.PROCESS.NOT_FOUND}`
            : ERROR_MESSAGES.PROCESS.NOT_FOUND;

        super(
            HttpStatusCode.NOT_FOUND,
            'PROCESS_NOT_FOUND',
            message
        );
    }
}

export class ProcessAlreadyExistsError extends AppError {
    constructor(processName: string) {
        super(
            HttpStatusCode.CONFLICT,
            'PROCESS_ALREADY_EXISTS',
            `"${processName}" ${ERROR_MESSAGES.PROCESS.NAME_EXISTS}`
        );
    }
}

export class ProcessValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(
            HttpStatusCode.BAD_REQUEST,
            'PROCESS_INVALID_STATUS',
            message,
            details
        );
    }
}

export class ProcessOperationError extends AppError {
    constructor(
        message: string,
        code: keyof typeof ErrorCode = 'PROCESS_UPDATE_FAILED'
    ) {
        super(
            HttpStatusCode.BAD_REQUEST,
            code,
            message
        );
    }
}