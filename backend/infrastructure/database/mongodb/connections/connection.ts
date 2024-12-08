import mongoose from 'mongoose';

import { env } from '@/config';
import { logger } from '@/shared/utils/logger';

export class DatabaseConnection {
    private static instance: DatabaseConnection;
    
    private constructor() {
        this.setupEventListeners();
    }
    
    static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    
    private setupEventListeners(): void {
        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB bağlantısı koptu');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB yeniden bağlandı');
        });
    }
    
    async connect(): Promise<void> {
        try {
            const options = {
                user: env.mongodb.user,
                pass: env.mongodb.pass,
                autoIndex: env.nodeEnv !== 'production'
            };

            await mongoose.connect(env.mongodb.uri, options);
            logger.info('MongoDB bağlantısı başarılı');
        } catch (error) {
            logger.error('MongoDB bağlantı hatası:', error);
            process.exit(1);
        }
    }
}