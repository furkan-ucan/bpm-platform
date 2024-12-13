import { logger } from '@/shared/utils/logger';
import { ErrorMetrics } from '@/shared/monitoring/metrics/error-metrics';
import { AppError } from '@/shared/errors/base/app-error';
import { TechnicalError } from '@/shared/errors/base/app-error';

interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    retryableErrors?: string[];
}

export class ErrorRecovery {
    private static readonly DEFAULT_OPTIONS: Required<RetryOptions> = {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
        retryableErrors: []
    };

    static async retry<T>(
        operation: () => Promise<T>,
        options: RetryOptions = {}
    ): Promise<T> {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };
        let lastError: Error | null = null;
        let delay = opts.initialDelay;

        for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (err) {
                const error = err as AppError;
                lastError = error;

                // Hata metriğini güncelle
                ErrorMetrics.increment(
                    error instanceof AppError ? error.code : 'UNKNOWN',
                    error.message
                );

                // Son deneme ise hatayı fırlat
                if (attempt === opts.maxRetries) {
                    throw error;
                }

                // Hatanın yeniden denenebilir olup olmadığını kontrol et
                if (opts.retryableErrors.length > 0 &&
                    error instanceof AppError &&
                    !opts.retryableErrors.includes(error.code)) {
                    throw error;
                }

                // Log retry attempt
                logger.warn(`Retry attempt ${attempt}/${opts.maxRetries}`, {
                    error: error.message,
                    nextRetryIn: delay,
                    operation: operation.name
                });

                // Delay before next retry
                await this.sleep(delay);

                // Exponential backoff with max delay
                delay = Math.min(delay * opts.backoffFactor, opts.maxDelay);
            }
        }

        throw lastError || new TechnicalError('Unknown error occurred');
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async withCircuitBreaker<T>(
        operation: () => Promise<T>,
        options: {
            maxFailures?: number;
            resetTimeout?: number;
        } = {}
    ): Promise<T> {
        const maxFailures = options.maxFailures || 5;
        const resetTimeout = options.resetTimeout || 60000;

        // Circuit breaker implementation gelecek
        return operation();
    }
} 