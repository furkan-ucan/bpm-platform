import { TechnicalError } from '../types';
import { AppError, ValidationError, NotFoundError } from '../types/app-error';
import { logger } from '@/shared/utils/logger';

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

        // Hata dönüşümleri
        if (error.name === "CastError") {
            throw new ValidationError(`Geçersiz ${context.domain} ID formatı`);
        }

        if (error.name === "DocumentNotFoundError") {
            throw new NotFoundError(`${context.domain} bulunamadı`);
        }

        // Eğer zaten AppError ise direkt fırlat
        if (error instanceof AppError) {
            throw error;
        }

        // Bilinmeyen hatalar için teknik hata
        throw new TechnicalError(
            process.env.NODE_ENV === 'production'
                ? 'Beklenmeyen bir hata oluştu'
                : error.message
        );
    }
} 