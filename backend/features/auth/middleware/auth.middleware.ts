import { type Request, type Response, type NextFunction } from 'express';
import { type Document, type Types } from 'mongoose';

import { verifyToken } from '@/security/authentication/providers/jwt.provider';
import { AuthenticationError, AuthorizationError } from '@/shared/errors/types/app-error';

import { User, type IUser } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
    user: Document<unknown, unknown, IUser> & 
          IUser & {
            _id: Types.ObjectId;
            id: string;
          };
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AuthenticationError('Token bulunamadı');
        }

        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token);

        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            throw new AuthenticationError('Kullanıcı bulunamadı veya aktif değil');
        }

        const userDoc = user as Document<unknown, unknown, IUser> & IUser & {
            _id: Types.ObjectId;
            id: string;
        };

        (req as AuthenticatedRequest).user = userDoc;

        next();
    } catch (error) {
        if (error instanceof AuthenticationError) {
            next(error);
        } else {
            next(new AuthenticationError('Kimlik doğrulama hatası'));
        }
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            return next(new AuthenticationError('Kimlik doğrulaması gerekli'));
        }

        if (!roles.includes(authReq.user.role)) {
            return next(new AuthorizationError('Bu işlem için yetkiniz yok'));
        }

        next();
    };
};