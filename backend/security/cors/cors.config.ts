import cors from 'cors';
import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 600 // 10 minutes
};

export const corsMiddleware = cors(corsOptions);
