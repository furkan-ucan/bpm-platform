import { Request } from 'express';
import { Document, Types } from 'mongoose';
import { IUser } from '@/features/auth/models/user.model';

type AuthUser = Document<unknown, any, IUser> & 
    Omit<IUser, 'id'> & 
    { _id: Types.ObjectId; id: string };

export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}