import { type Request, type Response, type NextFunction, type ErrorRequestHandler } from 'express';

import { env } from '@/config';
import { logger } from '@/shared/utils/logger';

import { AppError } from '../types/app-error';

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