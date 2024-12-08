import { type Request } from 'express';
import { type Document, type Types } from 'mongoose';

import { type IUser } from '@/features/auth/models/user.model';

type AuthUser = Document<unknown, any, IUser> & 
    Omit<IUser, 'id'> & 
    { _id: Types.ObjectId; id: string };

export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}