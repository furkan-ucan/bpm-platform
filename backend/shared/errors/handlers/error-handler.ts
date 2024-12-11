import { type Request, type Response, type NextFunction } from 'express';
import { env } from '@/config';
import { logger } from '@/shared/utils/logger';
import { AppError, ValidationError, NotFoundError, TechnicalError } from '../types/app-error';

// Domain seviyesinde hata yakalama
export class DomainErrorHandler {
    static handle(error: any, context: {
        domain: string;
        action: string;
        resourceId?: string;
        userId?: string;
    }) {
        logger.error(`${context.domain} ${context.action} error:`, {
            error,
            ...context,
            timestamp: new Date()
        });

        if (error.name === "CastError") {
            throw new ValidationError(`Geçersiz ${context.domain} ID formatı`);
        }

        if (error.name === "DocumentNotFoundError") {
            throw new NotFoundError(`${context.domain} bulunamadı`);
        }

        if (error instanceof AppError) {
            throw error;
        }

        throw new TechnicalError(
            env.nodeEnv === 'production'
                ? 'Beklenmeyen bir hata oluştu'
                : error.message
        );
    }
}

// Global Express error middleware
export const globalErrorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log error details
    logger.error('Error occurred:', {
        error: error.message,
        stack: env.nodeEnv === 'development' ? error.stack : undefined,
        path: req.path,
        method: req.method,
        userId: (req as any).user?._id,
        timestamp: new Date().toISOString(),
    });

    // Handle AppError instances
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: 'error',
            code: error.name,
            message: error.message,
            errors: (error as any).errors // ValidationError için
        });
    }

    // Handle unknown errors
    res.status(500).json({
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: env.nodeEnv === 'production'
            ? 'Sunucu hatası'
            : error.message
    });
}; 