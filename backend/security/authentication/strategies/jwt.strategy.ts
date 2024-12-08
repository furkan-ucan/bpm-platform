import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '@/config/env';
import { AppError } from '@/shared/errors/types/app-error';
import { IUser } from '@/features/auth/models/user.model';

interface JWTPayload extends JwtPayload {
    id: string;
    email: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new AppError('Token bulunamadı', 401);
        }
        
        if (!config.jwt.secret) {
            throw new AppError('JWT secret tanımlanmamış', 500);
        }
        
        const decoded = jwt.verify(token, config.jwt.secret as jwt.Secret) as JWTPayload;
        req.user = decoded as IUser & { id: string };
        next();
    } catch (error) {
        next(new AppError('Geçersiz token', 401));
    }
}; 