import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';

import { env } from '@/config';
import { authRoutes } from '@/features/auth/routes/auth.routes';
import { processRoutes } from '@/features/processes/routes/process.routes';
import taskRoutes from '@/features/tasks/routes/task.routes';
import { DatabaseConnection } from '@/infrastructure/database/mongodb/connections/connection';
import { errorHandler } from '@/shared/errors/handlers/error-handler';

import { requestLogger } from './middleware/request-logger';

export class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(requestLogger);
    }

    private initializeRoutes(): void {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'success',
                message: 'Server is running',
                timestamp: new Date().toISOString()
            });
        });

        // API routes
        this.app.use(`${env.apiPrefix}/auth`, authRoutes);
        this.app.use(`${env.apiPrefix}/processes`, processRoutes);
        this.app.use(`${env.apiPrefix}/tasks`, taskRoutes);
    }

    private initializeErrorHandling(): void {
        this.app.use(errorHandler);
    }

    public async listen(): Promise<void> {
        try {
            await DatabaseConnection.getInstance().connect();
            this.app.listen(env.port, () => {
                console.log(`Server is running on port ${env.port}`);
            });
        } catch (error) {
            console.error('Server initialization failed:', error);
            process.exit(1);
        }
    }
} 