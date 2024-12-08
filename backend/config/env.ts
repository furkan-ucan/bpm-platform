import dotenv from 'dotenv';

dotenv.config();

export const env = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    mongodb: {
        uri: process.env.MONGODB_URI,
        user: process.env.MONGODB_USER,
        pass: process.env.MONGODB_PASSWORD,
    },
    jwt: {
        secret: process.env.JWT_SECRET
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD
    },
    nodeEnv: process.env.NODE_ENV || 'development'
}; 