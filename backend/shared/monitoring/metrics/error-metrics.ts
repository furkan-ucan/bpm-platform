import { ErrorNamespace } from '@/shared/errors/codes/error-codes';

interface ErrorMetric {
    count: number;
    lastOccurred: Date;
    details: Array<{
        timestamp: Date;
        message: string;
        code: string;
    }>;
}

export class ErrorMetrics {
    private static metrics: Map<string, ErrorMetric> = new Map();
    private static readonly MAX_DETAILS = 100; // Her hata kodu için maksimum kayıt

    static increment(errorCode: string, message: string): void {
        const metric = this.metrics.get(errorCode) || {
            count: 0,
            lastOccurred: new Date(),
            details: []
        };

        metric.count++;
        metric.lastOccurred = new Date();

        // Detay bilgisini ekle
        metric.details.unshift({
            timestamp: new Date(),
            message,
            code: errorCode
        });

        // Maximum kayıt sayısını kontrol et
        if (metric.details.length > this.MAX_DETAILS) {
            metric.details.pop();
        }

        this.metrics.set(errorCode, metric);
    }

    static getMetricsByNamespace(namespace: ErrorNamespace): Record<string, ErrorMetric> {
        const result: Record<string, ErrorMetric> = {};

        this.metrics.forEach((metric, code) => {
            if (code.startsWith(namespace)) {
                result[code] = metric;
            }
        });

        return result;
    }

    static getAllMetrics(): Record<string, ErrorMetric> {
        return Object.fromEntries(this.metrics);
    }

    static getErrorCount(errorCode: string): number {
        return this.metrics.get(errorCode)?.count || 0;
    }

    static reset(): void {
        this.metrics.clear();
    }

    static getRecentErrors(minutes: number = 60): Array<{ code: string; count: number }> {
        const threshold = new Date(Date.now() - minutes * 60000);
        const recentErrors: Array<{ code: string; count: number }> = [];

        this.metrics.forEach((metric, code) => {
            const recentCount = metric.details.filter(
                detail => detail.timestamp >= threshold
            ).length;

            if (recentCount > 0) {
                recentErrors.push({ code, count: recentCount });
            }
        });

        return recentErrors.sort((a, b) => b.count - a.count);
    }
} 