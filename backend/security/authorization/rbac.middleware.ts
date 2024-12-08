import { Response, NextFunction } from 'express';
import { AuthRequest } from '../authentication/auth.middleware';
import logger from '../../monitoring/logging/providers/winston.logger';

export const checkPermission = (requiredPermission: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not authenticated'
                });
            }

            if (!user.permissions || !user.permissions.includes(requiredPermission)) {
                logger.warn('Permission denied:', {
                    userId: user.id,
                    requiredPermission,
                    userPermissions: user.permissions,
                    path: req.path,
                    method: req.method
                });

                return res.status(403).json({
                    status: 'error',
                    message: 'Permission denied'
                });
            }

            next();
        } catch (error) {
            logger.error('Authorization error:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                path: req.path,
                method: req.method
            });

            return res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    };
};
