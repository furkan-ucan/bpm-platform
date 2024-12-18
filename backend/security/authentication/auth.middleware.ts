import { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

import { type IUser } from '@/features/auth/models/user.model.js';
import logger from '@/monitoring/logging/providers/winston.logger.js';

export interface AuthRequest extends Request {
    user?: IUser & {
        id: string;
        permissions: string[];
    };
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!process.env.JWT_SECRET) {
            logger.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as IUser & {
            id: string;
            permissions: string[];
        };
        
        req.user = decoded;
        return next();
    } catch (error) {
        logger.error('Authentication error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            path: req.path,
            method: req.method
        });

        return res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
};
