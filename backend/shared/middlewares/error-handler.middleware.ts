import { type ErrorRequestHandler } from 'express';
import { AppError } from '../errors/types/app-error';
import { logger } from '../utils/logger';
import { ERROR_MESSAGES } from '../constants/error-messages';

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
        res.status(400).json({
            status: 'error',
            code: 'DUPLICATE_KEY',
            message: 'Bu kayıt zaten mevcut'
        });
        return;
    }

    // Validasyon hatası
    if (error.name === 'ValidationError') {
        res.status(400).json({
            status: 'error',
            code: 'VALIDATION_ERROR',
            message: 'Validasyon hatası',
            details: error
        });
        return;
    }

    // Beklenmeyen hatalar
    res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: ERROR_MESSAGES.SYSTEM.INTERNAL_ERROR
    });
} 