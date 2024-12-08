import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../types/app-error';
import { logger } from '@/shared/utils/logger';
import { env } from '@/config';

export const errorHandler: ErrorRequestHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof AppError) {
        logger.warn(error.message, {
            statusCode: error.statusCode,
            path: req.path,
            method: req.method
        });

        res.status(error.statusCode).json({
            status: 'error',
            message: error.message
        });
        return;
    }

    logger.error('Beklenmeyen hata:', error);

    res.status(500).json({
        status: 'error',
        message: env.nodeEnv === 'production' 
            ? 'Sunucu hatası' 
            : error.message
    });
}; 