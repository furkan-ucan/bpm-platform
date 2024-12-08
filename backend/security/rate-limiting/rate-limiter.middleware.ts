import rateLimit from 'express-rate-limit';

import { logger } from '../../monitoring/logging/providers/winston.logger';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    handler: (req, res, next, options) => {
        logger.warn('Rate limit exceeded:', {
            ip: req.ip,
            path: req.path,
            method: req.method
        });
        res.status(429).json({
            status: 'error',
            message: options.message
        });
    }
});
