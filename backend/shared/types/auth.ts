import { Request, Response, NextFunction } from 'express';
import { IUser } from '@/features/auth/models/user.model';

export interface AuthenticatedRequest extends Request {
    user?: IUser & { id: string };
}

export type AuthRequestHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => Promise<void>;