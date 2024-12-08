import { type Request } from 'express';
import { type Types } from 'mongoose';

import { type IUser } from '@/features/auth/models/user.model';

export interface AuthRequest extends Request {
    user: IUser & {
        id: Types.ObjectId;
    };
} 