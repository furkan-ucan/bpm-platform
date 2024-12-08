import { Request } from 'express';
import { Types } from 'mongoose';
import { IUser } from '@/features/auth/models/user.model';

export interface AuthRequest extends Request {
    user: IUser & {
        id: Types.ObjectId;
    };
} 