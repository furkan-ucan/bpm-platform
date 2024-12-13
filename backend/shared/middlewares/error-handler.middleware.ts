import { type ErrorRequestHandler } from 'express';
import { AppError } from '@/shared/errors/base/app-error';
import { ValidationError } from '@/shared/errors/common/validation.error';
import { TechnicalError } from '@/shared/errors/common/technical.error';
import { ErrorCode } from '@/shared/errors/codes/error-codes';
import { logger } from '@/shared/utils/logger';
import { ERROR_MESSAGES } from '@/shared/constants/error-messages';

export const errorHandler: ErrorRequestHandler = (
    error: Error,
    req,
    res,
    next
): void => {
    logger.error('Hata yakalandı:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        userId: req.user?.id
    });

    // AppError instance'larını işle
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            status: 'error',
            code: error.code,
            message: error.message,
            details: error.details
        });
        return;
    }

    // MongoDB duplicate key hatası
    if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        const validationError = new ValidationError(
            'Bu kayıt zaten mevcut',
            { duplicateKey: Object.keys((error as any).keyPattern)[0] }
        );

        res.status(validationError.statusCode).json({
            status: 'error',
            code: ErrorCode.DB_DUPLICATE_KEY,
            message: validationError.message,
            details: validationError.details
        });
        return;
    }

    // Mongoose validasyon hatası
    if (error.name === 'ValidationError') {
        const validationError = new ValidationError(
            'Validasyon hatası',
            error
        );

        res.status(validationError.statusCode).json({
            status: 'error',
            code: ErrorCode.VALIDATION_ERROR,
            message: validationError.message,
            details: validationError.details
        });
        return;
    }

    // Beklenmeyen hatalar
    const technicalError = new TechnicalError(ERROR_MESSAGES.SYSTEM.INTERNAL_ERROR);
    res.status(technicalError.statusCode).json({
        status: 'error',
        code: technicalError.code,
        message: technicalError.message
    });
}