import { AppError } from '@/shared/errors/base/app-error';
import { ValidationError } from '@/shared/errors/common/validation.error';
import { TechnicalError } from '@/shared/errors/common/technical.error';
import { ErrorCode } from '@/shared/errors/codes/error-codes';
import { logger } from '@/shared/utils/logger';
import { env } from '@/config';

export class DomainErrorHandler {
    static handle(error: any, context: {
        domain: string;
        action: string;
        resourceId?: string;
        userId?: string;
    }) {
        // Hata loglaması
        logger.error(`${context.domain} ${context.action} error:`, {
            error,
            ...context,
            timestamp: new Date()
        });

        // MongoDB CastError (Geçersiz ID)
        if (error.name === "CastError") {
            throw new ValidationError(
                `Geçersiz ${context.domain} ID formatı`,
                { field: error.path, value: error.value }
            );
        }

        // MongoDB DocumentNotFoundError
        if (error.name === "DocumentNotFoundError") {
            throw new ValidationError(
                `${context.domain} bulunamadı`,
                { resourceId: context.resourceId }
            );
        }

        // Mongoose ValidationError
        if (error.name === "ValidationError") {
            throw new ValidationError(
                'Validasyon hatası',
                error.errors
            );
        }

        // Zaten AppError instance ise direkt fırlat
        if (error instanceof AppError) {
            throw error;
        }

        // Bilinmeyen hatalar için teknik hata
        throw new TechnicalError(
            env.nodeEnv === 'production'
                ? 'Beklenmeyen bir hata oluştu'
                : error.message
        );
    }
}