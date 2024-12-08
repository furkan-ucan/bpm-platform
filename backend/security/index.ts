import 'module-alias/register';
import cors from 'cors';
import { expressjwt } from "express-jwt";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { type Request } from 'express';

import { env, type SecurityConfig } from '@config/index';
import { corsConfig } from './cors/cors.config.js';

// Rate Limiter Configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için limit
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export function configureSecurity(config: SecurityConfig) {
    const corsOptions = {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin || config.cors.allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('CORS policy violation'));
            }
        },
        credentials: true,
        optionsSuccessStatus: 200
    };

    return {
        cors: cors(corsOptions),
        jwt: configureJwt(config.jwt)
    };
}

function configureJwt(jwtConfig: SecurityConfig['jwt']) {
    const getTokenFromRequest = (req: Request): string | undefined => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.split(' ')[1];
        }
        return undefined;
    };

    return expressjwt({
        secret: jwtConfig.secret,
        algorithms: ["HS256"],
        credentialsRequired: true,
        requestProperty: "user",
        getToken: getTokenFromRequest
    }).unless({
        path: [
          "/api/v1/auth/login",
          "/api/v1/auth/register",
          "/api/v1/auth/refresh-token",
          { url: /^\/api\/v1\/docs.*/, methods: ["GET"] },
        ],
    });
}

// Security Middleware
export const securityMiddleware = [
    helmet(),
    rateLimiter,
    configureSecurity({
      cors: {
        allowedOrigins: env.allowedOrigins
      },
      jwt: {
        secret: env.jwt.secret,
        expiresIn: env.jwt.expiresIn
      }
    }).jwt,
  ];
