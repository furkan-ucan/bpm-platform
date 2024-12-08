import cors from 'cors';

import type { CorsOptions } from 'cors';
import { type SecurityConfig } from '@/config';

export function corsConfig(config: SecurityConfig['cors']): CorsOptions {
    return {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin || config.allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('CORS policy violation'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['X-Total-Count'],
        credentials: true,
        maxAge: 600 // 10 minutes
    };
}

export const corsMiddleware = cors(corsConfig({ allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'] }));
