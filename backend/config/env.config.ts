import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    allowedOrigins: Array.isArray(process.env.ALLOWED_ORIGINS) 
        ? process.env.ALLOWED_ORIGINS 
        : (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),

    // Database
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bpm-platform',
        user: process.env.MONGODB_USER,
        pass: process.env.MONGODB_PASS
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD
    },

    // RabbitMQ
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        user: process.env.RABBITMQ_USER || 'guest',
        pass: process.env.RABBITMQ_PASS || 'guest'
    },

    // Email
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },

    // Storage
    storage: {
        type: process.env.STORAGE_TYPE || 'local',
        cloud: {
            key: process.env.CLOUD_STORAGE_KEY,
            secret: process.env.CLOUD_STORAGE_SECRET
        }
    }
}; 