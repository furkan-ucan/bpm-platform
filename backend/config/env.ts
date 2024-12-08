import dotenv from 'dotenv';

dotenv.config();

export const config = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    db: {
        uri: process.env.MONGODB_URI
    },
    jwt: {
        secret: process.env.JWT_SECRET
    }
}; 